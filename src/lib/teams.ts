import { Result } from "pg";
import { db } from "./db/client";
import { teams, eventTeams } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getTeamById(id: number) {
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createTeam(name: string, owner: string) {
  const [team] = await db
    .insert(teams)
    .values({ name, owner })
    .returning();
  return team;
}

export async function getTeams() {
  return await db.query.teams.findMany();
}

export async function addTeamToEvent(eventId: number, teamId: number) {
  const [eventTeam] = await db
    .insert(eventTeams)
    .values({ eventId, teamId })
    .returning();

  return eventTeam;
}

export async function getTeamsByEventId(eventId: number) {
  return await db
    .select({
      id: teams.id,
      name: teams.name,
      owner: teams.owner,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
    })
    .from(eventTeams)
    .innerJoin(teams, eq(eventTeams.teamId, teams.id))
    .where(eq(eventTeams.eventId, eventId));
}
