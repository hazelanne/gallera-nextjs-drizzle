"use client";

import { useEffect, useState } from "react";
import { StopCircle, PlusCircle } from "lucide-react";
import { Team, Event } from "@/components/admin/types";
import FightsPanel from "./FightsPanel";
import TeamsPanel from "./TeamsPanel";

export default function EventTab() {
  const [loading, setLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetchCurrentEvent();
  }, []);

  useEffect(() => {
    async function fetchRegisteredTeams(eventId: number) {
      try {
        const res = await fetch(`/api/events/${eventId}/teams`);
        if (!res.ok) throw new Error("Failed to load teams");
        const teams = await res.json();

        if (teams.length > 0) {
          setTeams(teams);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load teams");
      }
    }

    if (currentEvent) {
      fetchRegisteredTeams(currentEvent.id);
    }
  }, [currentEvent]);

  async function fetchCurrentEvent() {
    try {
      const res = await fetch("/api/events/current");
      if (res.ok) {
        const data = await res.json();
        setCurrentEvent(data);
      }
    } finally {
      setLoading(false);
    }
  }

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

  async function addTeam(team: Team) {
    setTeams((prev) => [...prev, team]);
  }

  async function removeTeam(teamId: number) {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  }

  return (
    <div className="space-y-6">
      {loading ? (
        // Skeleton/Loader
        <div className="p-10 flex justify-center items-center">
          <span className="text-gray-500 animate-pulse">Loading event...</span>
        </div>
      ): !currentEvent ? (
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
                <button
                  onClick={() => endEvent(currentEvent.id)}
                  className="p-2 bg-red-600 text-white rounded-2xl shadow hover:bg-red-700 flex flex-col items-center"
                >
                  <StopCircle size={18} />
                  <span className="mt-1 hidden sm:block">End Event</span>
                </button>
            </div>

            {/* Teams section */}
            <TeamsPanel 
              eventId={currentEvent.id} 
              teams={teams} 
              onTeamAdded={(team) => addTeam(team)}
              onTeamRemoved={(teamId) => removeTeam(teamId)}
            />
          </div>

          {/* Fights Controls and list */}
          <FightsPanel 
            eventId={currentEvent.id} 
            teams={teams}
          />
        </>
      )}
    </div>
  );
}
