import { db } from "@/lib/db/client";
import { events, fights, bets, users, transactions } from "@/lib/db/schema";
import { getCurrentEvent } from "@/lib/events";
import { and, or, eq, ne, asc, desc, sql, isNotNull } from "drizzle-orm";
import { broadcast } from "@/lib/ws";

const houseCut = 0.9;

function computePayouts(tally: Record<string, number>) {
  const payout: Record<string, number> = { DEHADO: 0, LIYAMADO: 0, DRAW: 0 };

  const totalPool = tally.DEHADO + tally.LIYAMADO + tally.DRAW;

  if (tally.DEHADO > 0 && tally.LIYAMADO > 0) {
    payout.DEHADO = ((tally.LIYAMADO * houseCut) / tally.DEHADO) * 100 + 100;
    payout.LIYAMADO = ((tally.DEHADO * houseCut) / tally.LIYAMADO) * 100 + 100;
  }

  if (tally.DRAW > 0) {
    const distributable = totalPool * houseCut;
    payout.DRAW = Math.min((distributable / tally.DRAW) * 100, 800);
  }

  return payout;
}

async function applyBetPayout(bet: typeof bets.$inferSelect, payoutAmount: number) {
  await db.update(users)
    .set({ credits: sql`credits + ${payoutAmount}` })
    .where(eq(users.id, bet.userId));

  await db.update(bets)
    .set({ settled: true, won: true, wonAmount: String(payoutAmount) })
    .where(eq(bets.id, bet.id));

  await db.insert(transactions).values({
    userId: bet.userId,
    type: "payout",
    amount: String(payoutAmount),
    eventId: bet.eventId
  });
}

// Admin: start a new fight
export async function createNewFight(eventId: number, aSideId: number, bSideId: number) {
  const currentFight = await getCurrentFight();

  if (currentFight && currentFight.status !== "closed") {
    // Return the still-open fight, don’t create a new one
    return currentFight;
  }

  const [lastFight] = await db
    .select()
    .from(fights)
    .where(eq(fights.eventId, eventId))
    .orderBy(desc(fights.fightNumber))
    .limit(1);
  
  const nextFightNumber =
    lastFight && lastFight.fightNumber != null
      ? lastFight.fightNumber + 1
      : 1;

  const [fight] = await db
    .insert(fights)
    .values({
      aTeamId: aSideId,
      bTeamId: bSideId,
      eventId: eventId,
      fightNumber: nextFightNumber, 
      status: "open",
    })
    .returning();

  broadcast({ 
    type: "NEW_FIGHT", payload: {
      fightId: fight.id,
      fightNumber: nextFightNumber,
      status: fight.status
    }
  });

  return fight;
}

export async function getFight(id: number) {
  const fight = await db.query.fights.findFirst({
    where: (f) => and(
      eq(f.id, id)
    )
  });

  return fight;
}

// Admin: start fight (close betting, move to 'started')
export async function startFight(fightId: number) {
  const currentFight = await getFight(fightId);
  if (!currentFight) return null;

  if (currentFight.status !== "open") {
    // Can only start if betting was open
    return currentFight;
  }

  const [updated] = await db
    .update(fights)
    .set({ status: "started" })
    .where(eq(fights.id, currentFight.id))
    .returning();

  broadcast({ 
    type: "START_FIGHT", payload: {
      fightId: updated.id,
      status: updated.status,
      fightNumber: updated.fightNumber,
    }
  });

  return updated;
}

// Admin: end fight (finish fight and payouts)
export async function endFight(fightId: number, winner: string) {
  const result = await db.transaction(async (tx) => {
    // 1. Fetch current fight
    const currentFight = await tx.query.fights.findFirst({
      where: (f) => eq(f.id, fightId),
      orderBy: (f) => desc(f.createdAt),
    });

    if (!currentFight || currentFight.status !== "started") {
      throw new Error("Fight not started");
    }

    // 2. Fetch bets
    const betsForFight = await tx.query.bets.findMany({
      where: (b) => eq(b.fightId, currentFight.id),
    });

    // 3. Compute tally
    const tally = { DEHADO: 0, LIYAMADO: 0, DRAW: 0 };
    for (const bet of betsForFight) {
      tally[bet.betChoice as keyof typeof tally] += parseFloat(bet.amount);
    }

    // 4. Compute payouts
    const payout = computePayouts(tally);

    // 5. Apply payouts to winning bets
    const winningBets = betsForFight.filter((b) => b.betChoice === winner);
    for (const bet of winningBets) {
      const payoutAmount = (parseFloat(bet.amount) * payout[winner as keyof typeof payout]) / 100;
      await applyBetPayout(bet, payoutAmount);
    }

    // 6. Mark losing bets as settled
    const losingBets = betsForFight.filter((b) => b.betChoice !== winner);
    for (const bet of losingBets) {
      await tx.update(bets)
        .set({ settled: true, won: false })
        .where(eq(bets.id, bet.id));
    }

    // 7. Close fight
    const [updatedFight] = await tx.update(fights)
      .set({ winningSide: winner, status: "closed" })
      .where(eq(fights.id, currentFight.id))
      .returning();

    return updatedFight;
  });

  broadcast({ 
    type: "END_FIGHT", payload: {
      fightId: result.id,
      status: result.status,
      fightNumber: result.fightNumber,
    }
  });

  return result;
}

// Admin: cancel fight
export async function cancelFight(fightId: number) {
  // Start transaction
  const result = await db.transaction(async (tx) => {
    // 1. Fetch all bets for the fight
    const fightBets = await tx.query.bets.findMany({
      where: (b) => eq(b.fightId, fightId),
    });

    // 2. Refund each bet
    for (const bet of fightBets) {
      await tx.update(users)
        .set({ credits: sql`credits + ${bet.amount}` })
        .where(eq(users.id, bet.userId));

      // Record refund transaction
      await tx.insert(transactions).values({
        userId: bet.userId,
        type: "refund",
        amount: bet.amount,
        eventId: bet.eventId
      });

      // Optionally mark bet as settled or cancelled
      await tx.update(bets)
        .set({ settled: true, won: false })
        .where(eq(bets.id, bet.id));
    }

    // 3. Cancel the fight
    const [updatedFight] = await tx.update(fights)
      .set({ status: "cancelled" })
      .where(eq(fights.id, fightId))
      .returning();

    return updatedFight;
  });

  broadcast({ 
    type: "CANCEL_FIGHT", payload: {
      fightId: result.id,
      status: result.status,
      fightNumber: result.fightNumber,
    }
  });

  return result;
}


// Fetch the current open fight
export async function getCurrentFight() {
  const event = await getCurrentEvent();
  if (!event) return null;

  const fight = await db.query.fights.findFirst({
    where: (f) => and(
      eq(f.eventId, event.id),
      or(eq(f.status, "open"), eq(f.status, "started"))
    ),
    orderBy: (f) => desc(f.createdAt)
  });

  if (!fight) return null;

  // compute tally (bets per choice)
  const betsForFight = await db.query.bets.findMany({
    where: (b) => eq(b.fightId, fight.id),
  });

  const tally = { DEHADO: 0, LIYAMADO: 0, DRAW: 0 };
  for (const bet of betsForFight) {
    tally[bet.betChoice as keyof typeof tally] += parseFloat(bet.amount);
  }

  // compute payouts (per 100 credits wagered)
  const payout = computePayouts(tally);

  return {
    fightId: fight.id,
    status: fight.status,
    fightNumber: fight.fightNumber,
    tally,
    payout
  };
}

export async function countFights(eventId: number) {
  const [row] = await db
    .select({
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(fights)
    .where(eq(fights.eventId, eventId));

  return row?.count ?? 0;
}

export async function getFights(eventId: number, page: number = 0, limit: number = 10) {
  // Get fights for this page
  const fights = await db.query.fights.findMany({
    where: (f) => eq(f.eventId, eventId),
    orderBy: (f, { desc }) => [desc(f.id)], // newest first
    limit,
    offset: page * limit,
  });

  // Check if more fights exist beyond this page
  const totalCount = await db.query.fights.findMany({
    where: (f) => eq(f.eventId, eventId),
    columns: { id: true }, // only need ids
  });
  const hasMore = totalCount.length > (page + 1) * limit;

  return { fights, hasMore };
}

export async function getFightsWinners(eventId: number) {
  const results = await db
    .select({
      teamId: sql<number>`
        CASE 
          WHEN ${fights.winningSide} = 'LIYAMADO' THEN ${fights.aTeamId}
          WHEN ${fights.winningSide} = 'DEHADO' THEN ${fights.bTeamId}
        END
      `,
      wins: sql<number>`COUNT(*)`,
    })
    .from(fights)
    .where(
      and(
        eq(fights.eventId, eventId),
        eq(fights.status, "closed"),
        isNotNull(fights.winningSide)
      )
    )
    .groupBy(sql`
      CASE 
        WHEN ${fights.winningSide} = 'LIYAMADO' THEN ${fights.aTeamId}
        WHEN ${fights.winningSide} = 'DEHADO' THEN ${fights.bTeamId}
      END
    `);

  return results;
}
