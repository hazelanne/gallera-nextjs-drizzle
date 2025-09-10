"use client";

import { useEffect, useState, useMemo } from "react";
import { PlusCircle, X } from "lucide-react";
import { Team, Event, Tally } from "@/components/admin/types";
import FightsPanel from "./FightsPanel";
import TeamsPanel from "./TeamsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EventTab() {
  const [loading, setLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentTally, setCurrentTally] = useState<Tally[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showEndDialog, setShowEndDialog] = useState(false);

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
        setCurrentTally(data.tally);
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
    setShowEndDialog(false);
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
        <div className="p-10 flex justify-center items-center">
          <span className="text-gray-500 animate-pulse">Loading event...</span>
        </div>
      ) : !currentEvent ? (
        <div
          onClick={createEvent}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-green-500 hover:bg-green-50 transition"
        >
          <PlusCircle size={48} className="text-green-600 mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">
            Start a New Event
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Click here to create and manage fights under a new event.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Sticky Event Header */}
          <div className="flex items-center justify-between p-4 bg-gray-300 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-black">
              {currentEvent.name}
            </h2>
            <button
              onClick={() => setShowEndDialog(true)}
              className="flex flex-col items-center justify-center p-2 bg-red-500 text-white rounded-2xl shadow hover:bg-red-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs for Teams & Fights */}
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="w-full flex justify-around bg-gray-100 rounded-t-lg">
              <TabsTrigger
                value="teams"
                className="w-full data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:font-semibold data-[state=active]:shadow-inner rounded-t-lg transition"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value="fights"
                className="w-full data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:font-semibold data-[state=active]:shadow-inner rounded-t-lg transition"
              >
                Fights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams">
              <TeamsPanel
                eventId={currentEvent.id}
                teams={teams}
                tally={currentTally}
                onTeamAdded={addTeam}
                onTeamRemoved={removeTeam}
              />
            </TabsContent>

            <TabsContent value="fights">
              <FightsPanel eventId={currentEvent.id} teams={teams} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* End Event Confirmation Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Event?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Ending this event will prevent new fights from being created. This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => currentEvent && endEvent(currentEvent.id)}
            >
              Confirm End
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
