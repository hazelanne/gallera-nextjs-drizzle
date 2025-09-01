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

export async function renameEvent(eventId: number, newName: string) {
  await db
    .update(events)
    .set({ name: newName })
    .where(eq(events.id, eventId));
}

export async function endEvent(eventId: number) {
  await db
    .update(events)
    .set({ status: "closed" })
    .where(eq(events.id, eventId));
}

export async function endCurrentEvent() {
  const currentEvent = await getCurrentEvent();
  await endEvent(currentEvent?.id ?? 0);
}

export async function getCurrentEvent() {
  const event = await db.query.events.findFirst({
    orderBy: (f) => desc(f.createdAt)
  });

  return event;
}
