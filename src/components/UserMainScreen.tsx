"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BetHistoryModal from "./BetHistoryModal";
import { Wallet, History, Menu, Signal, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Components ---
function BalanceCard({value}: {
  value: number | string;
}) {
  return (
    <div className="bg-white rounded-xl shadow px-4 py-2 flex items-center gap-3">
      <Wallet className="w-6 h-6 text-gray-500" />
      <div className="text-right flex-1">
        <div className="text-2xl font-bold text-gray-800">
          {typeof value === "number" ? value.toFixed(2) : value}
        </div>
      </div>
    </div>
  );
}

function BetChoiceCard({
  choice,
  tally,
  disabled,
  onClick,
  hideTallyIfDraw = true,
}: {
  choice: "LIYAMADO" | "DEHADO" | "DRAW";
  tally: number;
  disabled: boolean;
  onClick: () => void;
  hideTallyIfDraw?: boolean;
}) {
  let colorClass = "";
  if (choice === "LIYAMADO") colorClass = "bg-red-600 hover:bg-red-700";
  if (choice === "DEHADO") colorClass = "bg-blue-600 hover:bg-blue-700";
  if (choice === "DRAW") colorClass = "bg-green-600 hover:bg-green-700";

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={`w-full p-3 rounded-lg text-white font-semibold disabled:opacity-60 ${colorClass}`}
        disabled={disabled}
      >
        {choice}
      </button>
      {!(hideTallyIfDraw && choice === "DRAW") && (
        <div className="mt-1 text-sm text-gray-600">{tally.toFixed(2)}</div>
      )}
    </div>
  );
}

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

  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  // fetch wallet and current fight
  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((j) => setBalance(j.balance))
      .catch(() => {});
    fetch("/api/fights/info")
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

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
    wsRef.current = ws;

    ws.onopen = () => setConnectionStatus("connected");
    ws.onclose = () => setConnectionStatus("disconnected");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "TALLY_UPDATE") {
        setTally(msg.payload.tally);
        setPayout(msg.payload.payout);
      }
      if (msg.type === "NEW_FIGHT") {
        console.log(`received new fight ${String(msg.payload.fightId)}`)
        setCurrentFight(msg.payload);
      }
      if (msg.type === "START_FIGHT") {
        setCurrentFight(msg.payload);
      }
      if (msg.type === "END_FIGHT" || msg.type === "CANCEL_FIGHT") {
        setCurrentFight(msg.payload);
        setTally({
            "DEHADO": 0,
            "LIYAMADO": 0,
            "DRAW": 0
        });
        setPayout({
            "DEHADO": 0,
            "LIYAMADO": 0,
            "DRAW": 0
        });

        fetch("/api/wallet")
          .then((r) => r.json())
          .then((j) => setBalance(j.balance))
          .catch(() => {});
      }
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(`{"event":"ping"}`);
    }, 29000);

    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handlePlaceBet = async (choice: string) => {
    if (amount <= 0) {
      alert("Enter amount > 0");
      return;
    }
    if (amount > balance) {
      alert("Insufficient balance");
      return;
    }
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
      setAmount(0);
    } else {
      alert(j.error || "Bet failed");
    }
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    connected: "text-green-600",
    connecting: "text-yellow-600",
    disconnected: "text-red-600",
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gallera</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              Fight #{currentFight ? currentFight.fightId : "—"} ·{" "}
              <Signal className={`w-4 h-4 ${statusColors[connectionStatus]}`} />
              <span className={statusColors[connectionStatus]}>
                {connectionStatus}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <BalanceCard value={balance}/>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowHistory(true)}>
                  <History className="w-4 h-4 mr-2" /> History
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                }}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

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
              <BetChoiceCard
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
