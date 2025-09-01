"use client";

import React, { useEffect, useRef, useState, useCallback  } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/player/Header";
import BetChoicesCard from "@/components/player/BetChoicesCard";
import BetHistoryModal from "@/components/player/BetHistoryModal";
import { useWebSocket } from "@/hooks/useWebSocket";

// --- Types ---
type Fight = {
  fightId: number;
  status: "open" | "started" | "closed" | "cancelled";
  tally: { DEHADO: number; LIYAMADO: number; DRAW: number };
  payout: { DEHADO: number; LIYAMADO: number; DRAW: number };
};

export default function UserMainScreen() {
  const [balance, setBalance] = useState<number>(0);
  const [currentFight, setCurrentFight] = useState<Fight | null>(null);
  const [tally, setTally] = useState<{ [key: string]: number }>({});
  const [bets, setBets] = useState<{ [key: string]: number }>({});
  const [payout, setPayout] = useState<{ [key: string]: number }>({});
  const [amount, setAmount] = useState<number>(0);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  // Initial fetch
  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((j) => setBalance(j.balance))
      .catch(() => {});
    fetch("/api/fights/current")
      .then((r) => r.json())
      .then((j) => {
        setCurrentFight(j);
        setTally(j.tally);
        setPayout(j.payout);

        fetch(`/api/bet?fightId=${j?.fightId}`)
          .then((r) => r.json())
          .then((j) => setBets(j.bets))
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  // WebSocket updates
  const handleWsMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case "TALLY_UPDATE":
        setTally(msg.payload.tally);
        setPayout(msg.payload.payout);
        break;
      case "NEW_FIGHT":
      case "START_FIGHT":
        setCurrentFight(msg.payload);
        break;
      case "END_FIGHT":
      case "CANCEL_FIGHT":
        setCurrentFight(msg.payload);
        setTally({ DEHADO: 0, LIYAMADO: 0, DRAW: 0 });
        setPayout({ DEHADO: 0, LIYAMADO: 0, DRAW: 0 });
        fetch("/api/wallet").then((r) => r.json()).then((j) => setBalance(j.balance));
        break;
    }
  }, []);
  const connectionStatus = useWebSocket(handleWsMessage);

  const handlePlaceBet = async (choice: string) => {
    if (amount <= 0) return alert("Enter amount > 0");
    if (amount > balance) return alert("Insufficient balance");
    if (!confirm(`Confirm bet of ${amount} on ${choice}?`)) return;

    setLoading(true);
    const res = await fetch(`/api/bet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fightId: currentFight?.fightId ?? 0, bet: choice, amount }),
    });
    const j = await res.json();
    if (res.ok) {
      setBets(j.bets);
      setBalance(j.balance);
      setAmount(0);
    } else {
      alert(j.error || "Bet failed");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Header
          balance={balance}
          fightId={currentFight?.fightId}
          connectionStatus={connectionStatus}
          onShowHistory={() => setShowHistory(true)}
          onLogout={handleLogout}
        />

        {/* Main Betting Panel */}
        <main className="bg-white p-6 rounded-xl shadow space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm mb-1 font-medium">Bet Amount</label>
            <input
              type="number"
              className="border p-2 rounded w-40"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          {/* Bet Choices */}
          <div className="grid grid-cols-3 gap-4">
            {["LIYAMADO", "DRAW", "DEHADO"].map((c) => (
              <BetChoicesCard
                key={c}
                choice={c as "LIYAMADO" | "DEHADO" | "DRAW"}
                tally={tally[c] ?? 0}
                disabled={loading || currentFight?.status !== "open"}
                onClick={() => handlePlaceBet(c)}
                hideTallyIfDraw
              />
            ))}
          </div>

          {/* Bets */}
          <section>
            <h3 className="font-semibold mb-2">Your Bets</h3>
            <div className="flex gap-3 text-sm">
              <div className="p-2 border rounded flex-1 text-center">
                {(bets.LIYAMADO ?? 0).toFixed(2)}
              </div>
              <div className="p-2 border rounded flex-1 text-center">
                {(bets.DRAW ?? 0).toFixed(2)}
              </div>
              <div className="p-2 border rounded flex-1 text-center">
                {(bets.DEHADO ?? 0).toFixed(2)}
              </div>
            </div>
          </section>

          {/* Payouts */}
          <section>
            <h3 className="font-semibold mb-2">Payouts</h3>
            <div className="flex gap-3 text-sm">
              <div className="p-2 border rounded flex-1 text-center bg-red-50">
                {(payout.LIYAMADO ?? 0).toFixed(2)}
              </div>
              <div className="p-2 border rounded flex-1 text-center bg-green-50">
                {(payout.DRAW ?? 0).toFixed(2)}
              </div>
              <div className="p-2 border rounded flex-1 text-center bg-blue-50">
                {(payout.DEHADO ?? 0).toFixed(2)}
              </div>
            </div>
          </section>
        </main>

        {/* History Modal */}
        {showHistory && <BetHistoryModal onClose={() => setShowHistory(false)} />}
      </div>
    </div>
  );
}
