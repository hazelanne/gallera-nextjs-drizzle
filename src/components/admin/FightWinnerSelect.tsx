"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FightWinnerSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (winner: string) => void;
}

export default function FightWinnerSelect({
  isOpen,
  onClose,
  onResult,
}: FightWinnerSelectProps) {
  const [pendingResult, setPendingResult] = useState<
    null | "LIYAMADO" | "DRAW" | "DEHADO"
  >(null);
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
  }, [countdown, pendingResult, onResult]);

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

  const progressColor =
    pendingResult === "LIYAMADO"
      ? "bg-red-600"
      : pendingResult === "DRAW"
      ? "bg-green-600"
      : pendingResult === "DEHADO"
      ? "bg-blue-600"
      : "bg-indigo-600";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Declare Result</DialogTitle>
        </DialogHeader>

        {/* If no result picked yet → show options */}
        {!pendingResult ? (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Button
              variant="destructive"
              onClick={() => chooseResult("LIYAMADO")}
            >
              LIYAMADO
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => chooseResult("DRAW")}
            >
              DRAW
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => chooseResult("DEHADO")}
            >
              DEHADO
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Pending countdown section */}
            <p className="text-center">
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

            {/* Countdown progress */}
            <Progress value={(countdown / 10) * 100} className="h-2" />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={undoResult}
              >
                Undo
              </Button>
              <Button className="flex-1" onClick={confirmResult}>
                Confirm Now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
