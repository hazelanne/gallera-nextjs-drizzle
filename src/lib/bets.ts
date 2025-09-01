import { db } from "./db/client";
import { bets, users, fights, transactions } from "./db/schema";
import { and, eq, sql, gte } from "drizzle-orm";
import { getCurrentFight } from "@/lib/fights";
import { recordTransaction } from "@/lib/funds";
import { broadcast } from "@/lib/ws";

export async function placeBet(
  userId: number,
  fightId: number,
  choice: string,
  amount: number,
) {
  let newBalance = 0;

  await db.transaction(async (tx) => {
    // 1. Verify user exists
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error("User not found");

    // 2. Verify fight is still open
    const [fight] = await tx.select().from(fights).where(eq(fights.id, fightId)).limit(1);
    if (!fight) throw new Error("Fight not open");
    if (fight.status !== "open") throw new Error("Betting is closed for this fight");

    // 3. Verify credits
    if (parseFloat(user.credits) - amount < 0) throw new Error("Insufficient credits");

    // 4. Deduct credits
    const [updatedUser] = await tx
      .update(users)
      .set({ credits: String(parseFloat(user.credits) - amount) })
      .where(eq(users.id, userId))
      .returning();

    // 5. Insert bet
    const [bet] = await tx.insert(bets).values({
      userId: userId,
      fightId: fightId,
      eventId: fight.eventId,
      betChoice: choice,
      amount: String(amount),
    }).returning();

    // 6. Record bet transaction
    await tx.insert(transactions).values({
      userId: bet.userId,
      type: "bet",
      amount: bet.amount,
      eventId: fight.eventId
    });
     
    newBalance = parseFloat(updatedUser.credits);
  });

  // Recompute + broadcast new tally
  const fight = await getCurrentFight();
  if (fight) {
    broadcast({ type: "TALLY_UPDATE", payload: fight });
  }

  const betsTotals = await getBetsTotals(userId, fightId);

  return { ok: true, bets: betsTotals, balance: newBalance };
}

export async function getBetsTotals(userId: number, fightId: number) {
    let betsTotals = {};

    // Compute totals by choice for this user/fight
    const betRows = await db
      .select({
        choice: bets.betChoice,
        total: sql<number>`SUM(${bets.amount})`,
      })
      .from(bets)
      .where(and(eq(bets.userId, userId), eq(bets.fightId, fightId)))
      .groupBy(bets.betChoice);

    // convert rows → { LIYAMADO: xxx, DEHADO: yyy }
    betsTotals = betRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.choice] = Number(row.total);
      return acc;
    }, {});

    return betsTotals;
}