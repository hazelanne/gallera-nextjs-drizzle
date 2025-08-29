import "dotenv/config";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

// typed hash helper
async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seed(): Promise<void> {
  console.log("DB URL:", process.env.DATABASE_URL);

  // hash all passwords in parallel
  const [adminPass, player1Pass, player2Pass] = await Promise.all([
    hash("admin"),
    hash("player1"),
    hash("player2"),
  ]);

  // insert users with roles + credits
  await db.insert(users).values([
    { username: "admin", passwordHash: adminPass, role: "admin", credits: "1000" },
    { username: "player1", passwordHash: player1Pass, role: "player", credits: "1000" },
    { username: "player2", passwordHash: player2Pass, role: "player", credits: "1000" },
  ]);

  console.log("✅ Seeding done");
}

// run seed
seed().catch((err) => {
  console.error("❌ Error during seeding:", err);
  process.exit(1);
});
