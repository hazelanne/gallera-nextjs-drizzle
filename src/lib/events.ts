import { db } from "./db/client";
import { events } from "./db/schema";
import { eq, desc, or } from "drizzle-orm";

export async function startEvent(name: string) {
  const [u] = await db
    .insert(events)
    .values({ name })
    .returning();
  return u;
}

export async function getEvent(eventId: number) {
  const event = await db.query.events.findFirst({
    where: (f) => or(eq(f.id, eventId))
  });

  return event;
}

export async function renameEvent(eventId: number, newName: string) {
  await db
    .update(events)
    .set({ name: newName })
    .where(eq(events.id, eventId))
    .returning();
}

export async function endEvent(eventId: number) {
  await db
    .update(events)
    .set({ status: "closed" })
    .where(eq(events.id, eventId))
    .returning();
}

export async function updateStatus(eventId: number, status: string) {
  const [updated] = await db
    .update(events)
    .set({ status: status })
    .where(eq(events.id, eventId))
    .returning();

  return updated;
}

export async function endCurrentEvent() {
  const currentEvent = await getCurrentEvent();
  return await endEvent(currentEvent?.id ?? 0);
}

export async function getCurrentEvent() {
  const event = await db.query.events.findFirst({
    where: (f) => or(eq(f.status, "open")),
    orderBy: (f) => desc(f.createdAt)
  });

  return event;
}

export async function getAllEvents() {
  const event = await db.query.events.findMany({
    orderBy: (f) => desc(f.createdAt)
  });

  return event;
}
