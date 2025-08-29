"use client";
import React, { useEffect, useState } from "react";

type Entry = {
  fightId: number;
  datetime: string;
  bet: string;
  amount: number;
  potentialWinnings: number;
  result: string | null;
  netChange: number | null;
  balanceAfter: number | null;
};

export default function BetHistoryModal({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<Entry[]>([]);
  useEffect(() => {
    fetch("/api/history?token=client-demo-token")
      .then((r) => r.json())
      .then((j) => setHistory(j));
  }, []);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full p-4 rounded shadow overflow-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Bet History</h3>
          <button className="px-3 py-1 border rounded" onClick={onClose}>
            Close
          </button>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-2">Fight</th>
              <th className="p-2">Date</th>
              <th className="p-2">Bet</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Potential</th>
              <th className="p-2">Result</th>
              <th className="p-2">Net</th>
              <th className="p-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td className="p-2" colSpan={8}>
                  No history
                </td>
              </tr>
            )}
            {history.map((h, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{h.fightId}</td>
                <td className="p-2">{new Date(h.datetime).toLocaleString()}</td>
                <td className="p-2">{h.bet}</td>
                <td className="p-2">{h.amount.toFixed(2)}</td>
                <td className="p-2">{h.potentialWinnings.toFixed(2)}</td>
                <td className="p-2">{h.result ?? "PENDING"}</td>
                <td
                  className={`p-2 ${h.netChange && h.netChange > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {h.netChange
                    ? h.netChange > 0
                      ? `+${h.netChange.toFixed(2)}`
                      : h.netChange.toFixed(2)
                    : "-"}
                </td>
                <td className="p-2">{h.balanceAfter?.toFixed(2) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
