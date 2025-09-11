"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { Event, Fight } from "@/components/player/types";
import BalanceCard from "@/components/player/BalanceCard";
import Header from "@/components/player/Header";
import BetChoicesCard from "@/components/player/BetChoicesCard";
import BetAmountModal from "@/components/player/BetAmountModal";
import BetHistoryModal from "@/components/player/BetHistoryModal";
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

  const [betChoice, setBetChoice] = useState<
    "LIYAMADO" | "DEHADO" | "DRAW" | null
  >(null);

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
      case "CANCEL_FIGHT":
        setCurrentFight(msg.payload);
        setTally({ DEHADO: 0, LIYAMADO: 0, DRAW: 0 });
        setPayouts({ DEHADO: 0, LIYAMADO: 0, DRAW: 0 });
        fetch("/api/wallet")
          .then((r) => r.json())
          .then((j) => setBalance(j.balance));
        break;
    }
  }, []);
  const connectionStatus = useWebSocket(handleWsMessage);

  const totalWinnings = useMemo(() => {
    const result: { [key: string]: number } = {};

    for (const key in bets) {
      const bet = bets[key] ?? 0;
      const payoutFactor = payouts[key] ?? 0;

      result[key] = (bet * payoutFactor) / 100;
    }

    return result;
  }, [bets, payouts]);

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

        {/* Main Betting Panel */}
        <main className="bg-white p-4 rounded-xl shadow space-y-4">
          {/* Balance */}
          <BalanceCard balance={balance} />

          {/* Feed */}
          {showFeed && (
            <EventFeed
              currentEvent={currentEvent}
              currentFight={currentFight}
            />
          )}

          {/* Bet Choices */}
          <div className="grid grid-cols-3 gap-4">
            {["LIYAMADO", "DRAW", "DEHADO"].map((c) => (
              <BetChoicesCard
                key={c}
                choice={c as "LIYAMADO" | "DEHADO" | "DRAW"}
                tally={tally[c] ?? 0}
                payout={payouts[c] ?? 0}
                disabled={loading || currentFight?.status !== "open"}
                onClick={() => setBetChoice(c as any)}
              />
            ))}
          </div>

          {/* Bets */}
          <section>
            <h3 className="font-semibold mb-2 text-sm text-gray-500">
              Your Bets
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {(["LIYAMADO", "DRAW", "DEHADO"] as const).map((choice) => {
                const bg =
                  choice === "LIYAMADO"
                    ? "bg-red-50"
                    : choice === "DRAW"
                    ? "bg-green-50"
                    : "bg-blue-50";

                const betAmount = bets[choice] ?? 0;
                const winnings = totalWinnings[choice] ?? 0;

                return (
                  <div key={choice} className="flex flex-col gap-2">
                    {/* Bet Card */}
                    <div
                      className={`${bg} rounded-xl shadow-sm p-3 flex flex-col items-center justify-center`}
                    >
                      <div className="text-lg font-bold text-gray-800">
                        {betAmount.toFixed(0)}
                      </div>
                    </div>

                    {/* Winnings Card (only if bet > 0) */}
                    {betAmount > 0 && (
                      <div className="rounded-xl shadow-sm p-2 flex items-center justify-center bg-yellow-50">
                        <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-yellow-700">
                          {winnings.toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bet Amount Modal */}
          {betChoice && (
            <BetAmountModal
              choice={betChoice}
              balance={balance}
              onConfirm={(amount) => {
                handlePlaceBet(betChoice, amount);
                setBetChoice(null);
              }}
              onClose={() => setBetChoice(null)}
            />
          )}
        </main>

        {/* History Modal */}
        {showHistory && (
          <BetHistoryModal onClose={() => setShowHistory(false)} />
        )}
      </div>
    </div>
  );
}
