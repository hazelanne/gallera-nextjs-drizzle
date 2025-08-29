import { db } from "@/lib/db/client";
import { transactions, treasury, TransactionType } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function recordTransaction(
  userId: number, 
  type : TransactionType, 
  amount: number
) {
  await db.transaction(async (tx) => {
    // Insert ledger entry
    await tx.insert(transactions).values({
      userId: userId,
      type: type,
      amount: String(amount)
    });

    // Update house liquidity depending on transaction type
    switch (type) {
      case "deposit":
        await tx.update(treasury).set({
          availableCredits: sql`${treasury.availableCredits} + ${amount}`,
          updatedAt: sql`now()`,
        }).where(eq(treasury.id, 1));
        break;

      case "withdrawal":
        await tx.update(treasury).set({
          availableCredits: sql`${treasury.availableCredits} - ${amount}`,
          updatedAt: sql`now()`,
        }).where(eq(treasury.id, 1));
        break;

      case "bet":
        await tx.update(treasury).set({
          availableCredits: sql`${treasury.availableCredits} - ${amount}`,
          outstandingBets: sql`${treasury.outstandingBets} + ${amount}`,
          updatedAt: sql`now()`,
        }).where(eq(treasury.id, 1));
        break;

      case "payout":
        await tx.update(treasury).set({
          availableCredits: sql`${treasury.availableCredits} - ${amount}`,
          liabilities: sql`${treasury.liabilities} - ${amount}`,
          updatedAt: sql`now()`,
        }).where(eq(treasury.id, 1));
        break;

      case "refund":
        await tx.update(treasury).set({
          availableCredits: sql`${treasury.availableCredits} + ${amount}`,
          outstandingBets: sql`${treasury.outstandingBets} - ${amount}`,
          updatedAt: sql`now()`,
        }).where(eq(treasury.id, 1));
        break;
    }
  });
}

export async function getTotalFinancials() {
  const result = await db
    .select({
      totalInflow: sql<number>`
        COALESCE(SUM(CASE 
          WHEN ${transactions.type} IN ('deposit', 'payout', 'refund') 
          THEN ${transactions.amount} ELSE 0 END), 0)
      `,
      totalOutflow: sql<number>`
        COALESCE(SUM(CASE 
          WHEN ${transactions.type} IN ('withdrawal', 'bet') 
          THEN ${transactions.amount} ELSE 0 END), 0)
      `,
      net: sql<number>`
        COALESCE(SUM(CASE 
          WHEN ${transactions.type} IN ('deposit', 'payout', 'refund') 
            THEN ${transactions.amount} 
          ELSE -${transactions.amount} END), 0)
      `,
    })
    .from(transactions);

  return result[0];
}

export async function getTodayFinancials() {
  const result = await db
    .select({
      todayInflow: sql<number>`
        COALESCE(SUM(CASE 
          WHEN ${transactions.type} IN ('deposit', 'payout', 'refund') 
          THEN ${transactions.amount} ELSE 0 END), 0)
      `,
      todayOutflow: sql<number>`
        COALESCE(SUM(CASE 
          WHEN ${transactions.type} IN ('withdrawal', 'bet') 
          THEN ${transactions.amount} ELSE 0 END), 0)
      `,
      todayNet: sql<number>`
        COALESCE(SUM(CASE 
          WHEN ${transactions.type} IN ('deposit', 'payout', 'refund') 
            THEN ${transactions.amount} 
          ELSE -${transactions.amount} END), 0)
      `,
    })
    .from(transactions)
    .where(sql`DATE(${transactions.createdAt}) = CURRENT_DATE`);

  return result[0];
}
