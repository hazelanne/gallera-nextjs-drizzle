import { db, Session } from "@/lib/db/client";
import { transactions, treasury, TransactionType } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getTotalBalance() {
  const [row] = await db
    .select({
      balance: treasury.balance,
      updatedAt: treasury.updatedAt,
    })
    .from(treasury)
    .orderBy(desc(treasury.updatedAt))
    .limit(1);

  return row?.balance ?? 0;
}

export async function getEventBalance(eventId: number) {
  const [row] = await db
    .select({
      inflow: sql<number>`SUM(
        CASE
          WHEN ${transactions.type} IN ('profit', 'bet') THEN ${transactions.amount}
          ELSE 0
        END
      )`.mapWith(Number),
      outflow: sql<number>`SUM(
        CASE
          WHEN ${transactions.type} IN ('payout', 'refund') THEN ${transactions.amount}
          ELSE 0
        END
      )`.mapWith(Number),
      net: sql<number>`SUM(
        CASE 
          WHEN ${transactions.type} = 'profit' THEN ${transactions.amount}
          WHEN ${transactions.type} = 'payout' THEN -${transactions.amount}
          WHEN ${transactions.type} = 'bet' THEN ${transactions.amount}
          WHEN ${transactions.type} = 'refund' THEN -${transactions.amount}
          ELSE 0
        END
      )`.mapWith(Number),
    })
    .from(transactions)
    .where(eq(transactions.eventId, eventId));

  return {
    inflow: row?.inflow ?? 0,
    outflow: row?.outflow ?? 0,
    net: row?.net ?? 0,
  };
}
