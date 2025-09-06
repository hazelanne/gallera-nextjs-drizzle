"use client";

import { useState, useEffect } from "react";

interface FightWinnerSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (winner: string) => void;
}

export default function FightWinnerSelect({ isOpen, onClose, onResult } : FightWinnerSelectProps) {
  const [pendingResult, setPendingResult] = useState<null | "LIYAMADO" | "DRAW" | "DEHADO">(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && pendingResult) {
      onResult(pendingResult);
      setPendingResult(null);
    }
  }, [countdown, pendingResult]);

  function chooseResult(result: "LIYAMADO" | "DRAW" | "DEHADO") {
    setPendingResult(result);
    setCountdown(10);
  }

  function confirmResult() {
    if (pendingResult) {
      onResult(pendingResult);
      setPendingResult(null);
      setCountdown(0);
      onClose();
    }
  }

  function undoResult() {
    setPendingResult(null);
    setCountdown(0);
  }

  if (!isOpen)
    return null;

  return (
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
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  )
}
