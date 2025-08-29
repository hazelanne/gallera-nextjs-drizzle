import { db } from "./db/client";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(id: number) {
  const r = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return r[0] ?? null;
}

export async function createUser(username: string, passwordHash: string) {
  const [u] = await db
    .insert(users)
    .values({ username, passwordHash: passwordHash })
    .returning();
  return u;
}
