import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { Fight } from "@/components/player/types";
import BetChoicesCard from "@/components/player/BetChoicesCard";
import BetAmountModal from "@/components/player/BetAmountModal";

interface BetsPanelProps {
  loading: boolean;
  currentFight: Fight | null;
  balance: number;
  bets: { [key: string]: number };
  tally: { [key: string]: number };
  payouts: { [key: string]: number };
  onPlaceBet: (choice: string, amount: number) => void;
}

export default function BetsPanel({
  loading,
  currentFight,
  balance,
  bets,
  tally,
  payouts,
  onPlaceBet,
}: BetsPanelProps) {
  const [betChoice, setBetChoice] = useState<
    "LIYAMADO" | "DEHADO" | "DRAW" | null
  >(null);

  const totalWinnings = useMemo(() => {
    const result: { [key: string]: number } = {};

    for (const key in bets) {
      const bet = bets[key] ?? 0;
      const payoutFactor = payouts[key] ?? 0;

      result[key] = (bet * payoutFactor) / 100;
    }

    return result;
  }, [bets, payouts]);

  return (
    <div>
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
      <div>
        <h3 className="font-semibold mb-2 text-sm text-gray-500 pt-4">
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
                <AnimatePresence>
                  {betAmount > 0 && (
                    <motion.div
                      key="winnings"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="rounded-xl shadow-sm p-2 flex items-center justify-center bg-yellow-50"
                    >
                      <div className="rounded-xl shadow-sm p-2 flex items-center justify-center bg-yellow-50">
                        <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-yellow-700">
                          {winnings.toFixed(0)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bet Amount Modal */}
      {betChoice && (
        <BetAmountModal
          choice={betChoice}
          balance={balance}
          onConfirm={(amount) => {
            onPlaceBet(betChoice, amount);
            setBetChoice(null);
          }}
          onClose={() => setBetChoice(null)}
        />
      )}
    </div>
  );
}
