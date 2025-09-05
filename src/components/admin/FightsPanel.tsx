"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Flag, XCircle, DoorOpen } from "lucide-react";
import { Fight } from "@/components/admin/types";
import FightList from "@/components/admin/FightList";

type Action = "open" | "start" | "cancel" | "end";

export default function FightsPanel({ eventId } : { eventId: number}) {
  const [loading, setLoading] = useState(false);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [pendingResult, setPendingResult] = useState<null | "LIYAMADO" | "DRAW" | "DEHADO">(null);
  const [countdown, setCountdown] = useState(0);
  const [fights, setFights] = useState<Fight[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentFight, setCurrentFight] = useState<Fight | null>(null);

  useEffect(() => {
    async function fetchFights() {
      try {
        const res = await fetch(`/api/fights?eventId=${eventId}&page=${page}&limit=10`);
        if (!res.ok) throw new Error("Failed to load fights");
        const data = await res.json();

        if (data.fights.length > 0) {
          setCurrentFight(data.fights[0]);
          setFights(data.fights);
          setHasMore(data.hasMore);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load fights");
      }
    }

    fetchFights();
  }, [page]);

  async function handleAction(action: Action, body?: any) {
    if (!currentFight && action !== "open") {
      alert("No active fight!");
      return;
    }

    setLoading(true);
    try {
      let apiPath;
      if (action === "open") {
        apiPath = `/api/fights/`;
      } else {
        apiPath = `/api/fights/${currentFight?.id}/${action}`;
      }
      
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const currentFightData = await res.json();
      setCurrentFight(currentFightData);
      alert(`${action.toUpperCase()} OK`);

      if (action === "open") {
        setFights((prev) => {
          if (page == 0) {
            return [...fights, currentFightData];
          }
          return prev;
        });
      } else {
        setFights((prev) => {
          const otherFights = prev.filter(f => f.id !== currentFightData.id);
          return [...otherFights, currentFightData]
        });
      }
    } catch (err) {
      console.error(err);
      alert(`Failed ${action}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenFight() {
    const sideA = prompt("Enter Side A name:") || "Side A";
    const sideB = prompt("Enter Side B name:") || "Side B";

    const body = {
      "eventId": eventId,
      "aSide": sideA,
      "bSide": sideB
    }

    await handleAction("open", body);
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && pendingResult) {
      handleAction("end", { result: pendingResult });
      setPendingResult(null);
    }
  }, [countdown, pendingResult]);

  function confirmCancel() {
    if (confirm("Are you sure you want to cancel this fight?")) {
      handleAction("cancel");
    }
  }

  function chooseResult(result: "LIYAMADO" | "DRAW" | "DEHADO") {
    setPendingResult(result);
    setCountdown(10);
  }

  function confirmResult() {
    setShowDeclareModal(false);
    if (pendingResult) {
      handleAction("end", { result: pendingResult });
      setPendingResult(null);
      setCountdown(0);
    }
  }

  function undoResult() {
    setPendingResult(null);
    setCountdown(0);
  }

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Header with event name + action */}
        <div className="flex items-center justify-between p-4 bg-gray-300">
          <h2 className="text-lg font-bold text-black">Fights</h2>

          {/* Action buttons (latest fight only) */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleOpenFight()}
              disabled={loading || currentFight !== null && (currentFight.status === "started" || currentFight.status === "open")}
              className="flex flex-col items-center justify-center p-2 bg-yellow-600 text-white rounded-2xl shadow hover:bg-yellow-700 disabled:opacity-50"
            >
              <DoorOpen size={20} />
              <span className="mt-1 hidden sm:block">Open</span>
            </button>
            <button
              onClick={() => handleAction("start")}
              disabled={loading || !currentFight || (currentFight.status !== "open" && currentFight.status !== "started" || currentFight.status === "started")}
              className="flex flex-col items-center justify-center p-2 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 disabled:opacity-50"
            >
              <PlayCircle size={20} />
              <span className="mt-1 hidden sm:block">Start</span>
            </button>
            <button
              onClick={() => setShowDeclareModal(true)}
              disabled={loading || !currentFight || currentFight.status !== "started"}
              className="flex flex-col items-center justify-center p-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 disabled:opacity-50"
            >
              <Flag size={20} />
              <span className="mt-1 hidden sm:block">Declare</span>
            </button>
            <button
              onClick={confirmCancel}
              disabled={loading || !currentFight || currentFight.status === "closed" || currentFight.status === "cancelled"}
              className="flex flex-col items-center justify-center p-2 bg-gray-600 text-white rounded-2xl shadow hover:bg-gray-700 disabled:opacity-50"
            >
              <XCircle size={20} />
              <span className="mt-1 hidden sm:block">Cancel</span>
            </button>
          </div>
        </div>

        <FightList fights={fights} page={page} hasMore={hasMore} onPageChange={setPage} />
      </div>

      {/* Declare modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md space-y-6">
            <h2 className="text-lg font-bold text-center">Declare Result</h2>

            {/* If no result picked yet → show options */}
            {!pendingResult ? (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => chooseResult("LIYAMADO")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  LIYAMADO
                </button>
                <button
                  onClick={() => chooseResult("DRAW")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  DRAW
                </button>
                <button
                  onClick={() => chooseResult("DEHADO")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  DEHADO
                </button>
              </div>
              
            ) : (
              <>
                {/* Pending countdown section */}
                <p className="mb-3 text-center">
                  Declaring{" "}
                  <span
                    className={
                      pendingResult === "LIYAMADO"
                        ? "text-red-600 font-bold"
                        : pendingResult === "DRAW"
                        ? "text-green-600 font-bold"
                        : "text-blue-600 font-bold"
                    }
                  >
                    {pendingResult}
                  </span>{" "}
                  in {countdown} seconds...
                </p>

                {/* Countdown bar */}
                <div className="w-full bg-gray-300 h-2 rounded-full mb-3">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${(countdown / 10) * 100}%` }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={undoResult}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Undo
                  </button>
                  <button
                    onClick={confirmResult}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Confirm Now
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setShowDeclareModal(false)}
              className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
