"use client";

import { useEffect, useState } from "react";

export default function FundsTab() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunds() {
      try {
        const res = await fetch("/api/funds");
        const data = await res.json();
        setBalance(parseFloat(data.overall));
      } catch (err) {
        console.error("Failed to fetch house funds:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFunds();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        Loading funds…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Funds</h2>

      {/* Summary card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-2xl shadow-md border ${
            balance >= 0
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <p className="text-sm font-medium text-gray-500">House Balance</p>
          <p
            className={`mt-2 text-3xl font-bold ${
              balance >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {balance.toFixed(2)}
          </p>
        </div>

        {/* Placeholder for future features */}
        <div className="p-6 rounded-2xl shadow-md border bg-white flex items-center justify-center text-gray-400">
          (Future: Modify user funds)
        </div>

        <div className="p-6 rounded-2xl shadow-md border bg-white flex items-center justify-center text-gray-400">
          (Future: Deposit / Withdraw)
        </div>
      </div>
    </div>
  );
}
