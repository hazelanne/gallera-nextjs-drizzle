"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Event, Fight } from "@/components/player/types";
import BalanceCard from "@/components/player/BalanceCard";
import Header from "@/components/player/Header";
import BetHistoryModal from "@/components/player/BetHistoryModal";
import BetsPanel from "@/components/player/BetsPanel";
import EventFeed from "@/components/player/EventFeed";

import { useWebSocket } from "@/hooks/useWebSocket";

export default function UserMainScreen() {
  const [loading, setLoading] = useState(false);
  const [showFeed, setShowFeed] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentFight, setCurrentFight] = useState<Fight | null>(null);
  const [tally, setTally] = useState<{ [key: string]: number }>({});
  const [bets, setBets] = useState<{ [key: string]: number }>({});
  const [payouts, setPayouts] = useState<{ [key: string]: number }>({});

  const [showHistory, setShowHistory] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  // Initial fetch
  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((j) => setBalance(j.balance))
      .catch(() => {});
    fetch("/api/events/current")
      .then((r) => r.json())
      .then((j) => {
        setCurrentEvent(j);
      });
    fetch("/api/fights/current")
      .then((r) => r.json())
      .then((j) => {
        setCurrentFight(j);
        setTally(j.tally);
        setPayouts(j.payout);

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
        setPayouts(msg.payload.payout);
        break;
      case "NEW_FIGHT":
      case "START_FIGHT":
        setCurrentFight(msg.payload);
        break;
      case "END_FIGHT":
        setCurrentFight(msg.payload);
        setTally({ DEHADO: 0, LIYAMADO: 0, DRAW: 0 });
        setPayouts({ DEHADO: 0, LIYAMADO: 0, DRAW: 0 });
        fetch("/api/wallet")
          .then((r) => r.json())
          .then((j) => setBalance(j.balance));
      case "CANCEL_FIGHT":
        setBets({ DEHADO: 0, LIYAMADO: 0, DRAW: 0 });
        break;
    }
  }, []);
  const connectionStatus = useWebSocket(handleWsMessage);

  const handlePlaceBet = async (choice: string, amount: number) => {
    if (amount <= 0) return alert("Enter amount > 0");
    if (amount > balance) return alert("Insufficient balance");
    if (!confirm(`Confirm bet of ${amount} on ${choice}?`)) return;

    setLoading(true);
    const res = await fetch(`/api/bet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fightId: currentFight?.fightId ?? 0,
        bet: choice,
        amount,
      }),
    });
    const j = await res.json();
    if (res.ok) {
      setBets(j.bets);
      setBalance(j.balance);
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
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <Header
          onShowHistory={() => setShowHistory(true)}
          onLogout={handleLogout}
        />

        <div className="px-2">
          {/* Balance always on top section */}
          <BalanceCard balance={balance} />

          {/* Live Feed in the middle */}
          {showFeed && (
            <EventFeed
              currentEvent={currentEvent}
              currentFight={currentFight}
            />
          )}

          {/* Bets Panel at bottom */}
          <BetsPanel
            loading={loading}
            currentFight={currentFight}
            balance={balance}
            bets={bets}
            tally={tally}
            payouts={payouts}
            onPlaceBet={handlePlaceBet}
          />
        </div>

        {/* History Modal */}
        {showHistory && (
          <BetHistoryModal
            currentEvent={currentEvent}
            open={showHistory}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>
    </div>
  );
}
