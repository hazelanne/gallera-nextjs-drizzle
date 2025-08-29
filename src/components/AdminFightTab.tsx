"use client";

import { useState, useEffect } from "react";
import { Play, Flag, XCircle, DoorOpen } from "lucide-react";

type Action = "open" | "start" | "cancel" | "result";

export default function AdminFightControls() {
  const [loading, setLoading] = useState(false);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [pendingResult, setPendingResult] = useState<null | "LIYAMADO" | "DRAW" | "DEHADO">(null);
  const [countdown, setCountdown] = useState(0);

  async function handleAction(action: Action, body?: any) {
    setLoading(true);
    try {
      const res = await fetch(`/api/fights/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      console.log(`${action} fight:`, data);
      alert(`${action.toUpperCase()} OK`);
    } catch (err) {
      console.error(err);
      alert(`Failed ${action}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && pendingResult) {
      handleAction("result", { result: pendingResult });
      setPendingResult(null);
    }
  }, [countdown, pendingResult]);

  function confirmCancel() {
    if (confirm("Are you sure you want to cancel this fight?")) {
      handleAction("cancel");
    }
  }

  function chooseResult(result: "LIYAMADO" | "DRAW" | "DEHADO") {
    setShowDeclareModal(false);
    setPendingResult(result);
    setCountdown(10);
  }

  function undoResult() {
    setPendingResult(null);
    setCountdown(0);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Fight Controls</h1>

      {/* Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => handleAction("open")}
          disabled={loading}
          className="flex flex-col items-center justify-center p-4 bg-yellow-600 text-white rounded-2xl shadow hover:bg-yellow-700"
        >
          <DoorOpen size={20} />
          <span className="mt-1">Open</span>
        </button>
        <button
          onClick={() => handleAction("start")}
          disabled={loading}
          className="flex flex-col items-center justify-center p-4 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700"
        >
          <Play size={20} />
          <span className="mt-1">Start</span>
        </button>
        <button
          onClick={() => setShowDeclareModal(true)}
          disabled={loading}
          className="flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700"
        >
          <Flag size={20} />
          <span className="mt-1">Declare</span>
        </button>
        <button
          onClick={confirmCancel}
          disabled={loading}
          className="flex flex-col items-center justify-center p-4 bg-gray-600 text-white rounded-2xl shadow hover:bg-gray-700"
        >
          <XCircle size={20} />
          <span className="mt-1">Cancel</span>
        </button>
      </div>

      {/* Pending result section */}
      {pendingResult && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-100 shadow">
          <p className="mb-3">
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

          <button
            onClick={undoResult}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Undo
          </button>
        </div>
      )}

      {/* Declare modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md space-y-6">
            <h2 className="text-lg font-bold text-center">Declare Result</h2>
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
