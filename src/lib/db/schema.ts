import {
  pgTable,
  primaryKey,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("player"),
  credits: numeric("credits", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").default("open").notNull(),
  fightCount: integer("fight_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventTeams = pgTable("event_teams", 
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.eventId, t.teamId] }),
  ]
);

export const fights = pgTable("fights", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  fightNumber: integer("fight_number"),
  aTeamId: integer("a_team_id")
    .notNull()
    .references(() => teams.id),
  bTeamId: integer("b_team_id")
    .notNull()
    .references(() => teams.id),
  status: text("status").default("open").notNull(), 
  winningSide: text("winning_side"),         // set when fight is settled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  fightId: integer("fight_id")
    .notNull()
    .references(() => fights.id),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  betChoice: text("bet_choice").notNull(),
  amount: numeric("amount").notNull(),
  settled: boolean("settled").default(false).notNull(),
  won: boolean("won"),
  wonAmount: numeric("won_amount").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "bet"
  | "payout"
  | "refund"
  | "profit";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").$type<TransactionType>().notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  eventId: integer("event_id").references(() => events.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const treasury = pgTable("treasury", {
  id: serial("id").primaryKey(),
  balance: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
