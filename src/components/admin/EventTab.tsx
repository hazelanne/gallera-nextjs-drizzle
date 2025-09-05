"use client";

import { useEffect, useState } from "react";
import { StopCircle, PlusCircle } from "lucide-react";
import FightsPanel from "./FightsPanel";

export default function EventTab() {
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
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    fetchCurrentEvent();
  }

  async function endEvent(id: number) {
    if (!confirm("End this event? This cannot be undone.")) return;
    const res = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });
    const data = await res.json();
    setCurrentEvent(data);
  }

  return (
    <div className="space-y-6">
      {!currentEvent ? (
        <div
          onClick={createEvent}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-green-500 hover:bg-green-50 transition"
        >
          <PlusCircle size={48} className="text-green-600 mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Start a New Event</h2>
          <p className="text-sm text-gray-500 mt-1">
            Click here to create and manage fights under a new event.
          </p>
        </div>
      ) : (
        <>
          {/* Event details card */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {/* Header with event name + action */}
            <div className="flex items-center justify-between p-4 bg-gray-300">
              <h2 className="text-lg font-bold text-black">{currentEvent.name}</h2>
              {currentEvent.status === "open" && (
                <button
                  onClick={() => endEvent(currentEvent.id)}
                  className="p-2 bg-red-600 text-white rounded-2xl shadow hover:bg-red-700 flex flex-col items-center"
                >
                  <StopCircle size={18} />
                  <span className="mt-1 hidden sm:block">End Event</span>
                </button>
              )}
            </div>

            {/* Body with details */}
            <div className="p-4">
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <span className="block text-gray-500 text-xs uppercase">Net</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {currentEvent.balance?.net ?? 0}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <span className="block text-gray-500 text-xs uppercase">Inflow</span>
                  <span className="text-lg font-semibold text-green-700">
                    {currentEvent.balance?.inflow ?? 0}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <span className="block text-gray-500 text-xs uppercase">Outflow</span>
                  <span className="text-lg font-semibold text-red-700">
                    {currentEvent.balance?.outflow ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Fights list + Controls */}
          <FightsPanel eventId={currentEvent.id} />
        </>
      )}
    </div>
  );
}
