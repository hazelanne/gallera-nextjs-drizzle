"use client";

import { useState, useEffect, useMemo } from "react";
import { Team, Tally } from "@/components/admin/types";

interface EventTeamsPanelProps {
  eventId: number;
  teams: Team[];
  tally: Tally[];
  onTeamAdded: (team: Team) => void;
  onTeamRemoved: (teamId: number) => void;
}

export default function TeamsPanel({
  eventId,
  teams,
  tally,
  onTeamAdded,
  onTeamRemoved,
}: EventTeamsPanelProps) {
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  const teamWinMap = useMemo(() => {
    return Object.fromEntries(
      tally.map((result) => [result.teamId, result.wins])
    );
  }, [tally]);

  async function addTeamToEvent(team: Team) {
    const params = { teamId: team.id };

    try {
      await fetch(`/api/events/${eventId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      onTeamAdded(team);
    } finally {
      setShowAddTeamModal(false);
    }
  }

  async function handleRemoveTeam(teamId: number) {
    if (!confirm("Remove Team?")) return;

    onTeamRemoved(teamId);
  }

  return (
    <div className="p-4 space-y-4">
      {/* <h3 className="text-md font-semibold mb-2">Participating Teams</h3> */}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                NAME
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                OWNER
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                WINS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teams.map((team: any) => (
              <tr key={team.id}>
                <td className="px-4 py-2 font-medium">{team.name}</td>
                <td className="px-4 py-2 text-gray-500">{team.owner}</td>
                <td className="px-4 py-2 text-center font-semibold text-green-700">
                  {teamWinMap[team.id] ?? 0}
                </td>
              </tr>
            ))}

            {/* Register Team placeholder as last row */}
            <tr>
              <td colSpan={3} className="px-4 py-2">
                <button
                  onClick={() => setShowAddTeamModal(true)}
                  className="w-full text-left px-3 py-2 border-2 border-dashed border-green-600 rounded-2xl text-green-600 hover:bg-green-50"
                >
                  + Register Team
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showAddTeamModal && (
        <AddTeamModal
          onClose={() => setShowAddTeamModal(false)}
          onSelectTeam={(team) => addTeamToEvent(team)}
        />
      )}
    </div>
  );
}

function AddTeamModal({
  onClose,
  onSelectTeam,
}: {
  onClose: () => void;
  onSelectTeam: (team: Team) => void;
}) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [existingTeams, setExistingTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<"search" | "create">("search");
  const [newOwner, setNewOwner] = useState("");

  useEffect(() => {
    async function fetchTeams() {
      const res = await fetch("/api/teams");
      if (res.ok) {
        return await res.json();
      }
    }

    setLoading(true);
    fetchTeams()
      .then(setExistingTeams)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchResults(
      existingTeams.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, existingTeams]);

  const exactMatch = searchResults.find(
    (r) => r.name.toLowerCase() === search.toLowerCase()
  );

  async function handleSelect(team: Team) {
    onSelectTeam(team);
  }

  async function handleCreate() {
    if (!search.trim() || !newOwner.trim()) return;
    const params = { name: search.trim(), owner: newOwner.trim() };

    const response = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to create team! Status: ${response.status}`);
    }

    const newTeam: Team = await response.json();
    onSelectTeam(newTeam);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 space-y-4">
        {step === "search" && (
          <>
            <h2 className="text-lg font-bold">Add Team to Event</h2>

            <input
              type="text"
              placeholder="Type to search or create..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border p-2 rounded-lg"
              autoFocus
            />

            {loading && (
              <div className="text-sm text-gray-500">Searching...</div>
            )}

            {(searchResults.length > 0 || search.trim()) && (
              <ul className="max-h-48 overflow-y-auto mt-2 space-y-1 border border-gray-200 rounded-lg shadow-sm">
                {searchResults.map((team) => (
                  <li
                    key={team.id}
                    onClick={() => handleSelect(team)}
                    className="flex justify-between items-center p-3 rounded-lg cursor-pointer transition 
                               hover:bg-blue-50 hover:shadow-sm active:bg-blue-100"
                  >
                    <span className="font-medium">{team.name}</span>
                    <span className="text-sm text-gray-500">{team.owner}</span>
                  </li>
                ))}

                {/* Create new team option */}
                {!exactMatch && search.trim() && (
                  <li
                    onClick={() => setStep("create")}
                    className="flex justify-between items-center p-3 rounded-lg cursor-pointer bg-green-50
                               hover:bg-green-100 transition"
                  >
                    <span>Create new team: "{search.trim()}"</span>
                    <span className="text-green-600 font-bold">&rarr;</span>
                  </li>
                )}
              </ul>
            )}
          </>
        )}

        {step === "create" && (
          <>
            <h2 className="text-lg font-bold">Create New Team</h2>
            <div className="text-sm text-gray-700 mb-2">
              Team name: <span className="font-medium">{search.trim()}</span>
            </div>

            <input
              type="text"
              placeholder="Owner name"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="w-full border p-2 rounded-lg mb-2"
              autoFocus
            />

            <button
              onClick={() => {
                handleCreate();
              }}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mb-2"
            >
              Create & Add
            </button>

            <button
              onClick={() => setStep("search")}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
          </>
        )}

        <div className="flex justify-end mt-2">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
