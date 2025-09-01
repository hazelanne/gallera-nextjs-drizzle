"use client";

import { useState, useEffect } from "react";
import { PlusCircle, StopCircle } from "lucide-react";

export default function EventsControlsTab() {
  const [loading, setLoading] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  async function fetchCurrentEvent() {
    const res = await fetch("/api/events/current");
    if (res.ok) {
      const data = await res.json(); 
      setCurrentEvent(data);
    }
  }

  useEffect(() => {
    fetchCurrentEvent();
  }, []);

  async function createEvent() {
    const name = prompt("Enter event name:");
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await fetchCurrentEvent();
    } finally {
      setLoading(false);
    }
  }

  async function endEvent() {
    if (!currentEvent) return;
    if (!confirm("End this event? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/events/${currentEvent.id}/end`, { method: "POST" });
      await fetchCurrentEvent();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Event Controls</h1>

      {currentEvent ? (
        <div className="p-4 border rounded-xl bg-gray-100">
          <p className="font-bold">{currentEvent.name}</p>
          <p>Status: {currentEvent.status}</p>
          <p>Fights: {currentEvent.fightCount}</p>
          <p>
            Balance: {currentEvent.balance?.inflow ?? 0} in /{" "}
            {currentEvent.balance?.outflow ?? 0} out / Net: {currentEvent.balance?.net ?? 0}
          </p>

          <button
            onClick={endEvent}
            disabled={loading}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <StopCircle className="inline mr-2" /> End Event
          </button>
        </div>
      ) : (
        <button
          onClick={createEvent}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusCircle className="inline mr-2" /> Create Event
        </button>
      )}
    </div>
  );
}
