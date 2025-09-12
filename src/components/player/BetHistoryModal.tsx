"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event } from "@/components/player/types";

type Entry = {
  fightNumber: number;
  betChoice: string;
  amount: number;
  won: boolean | null;
  wonAmount: number | null;
};

export default function BetHistoryModal({
  currentEvent,
  open,
  onClose,
}: {
  currentEvent: Event | null;
  open: boolean;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<Entry[]>([]);

  useEffect(() => {
    if (!currentEvent || !open) return;

    fetch(`/api/history?eventId=${currentEvent.id}`)
      .then((r) => r.json())
      .then(setHistory);
  }, [currentEvent, open]);

  const betChoiceColor = (bet: string) => {
    switch (bet) {
      case "LIYAMADO":
        return "text-red-600 font-semibold";
      case "DEHADO":
        return "text-blue-600 font-semibold";
      case "DRAW":
        return "text-green-600 font-semibold";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bet History</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto max-h-[70vh] mt-2">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Choice</th>
                <th className="p-2 text-left">Bet</th>
                <th className="p-2 text-left">W-L</th>
                <th className="p-2 text-left">PnL</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td className="p-2 text-center" colSpan={5}>
                    No history
                  </td>
                </tr>
              ) : (
                history.map((h, idx) => (
                  <tr
                    key={idx}
                    className={`border-t ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="p-2">{h.fightNumber}</td>
                    <td className={`p-2 ${betChoiceColor(h.betChoice)}`}>
                      {h.betChoice}
                    </td>
                    <td className="p-2">{h.amount}</td>
                    <td
                      className={`p-2 ${
                        h.won === null
                          ? ""
                          : h.won
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {h.won === null ? "-" : h.won ? "W" : "L"}
                    </td>
                    <td
                      className={`p-2 ${
                        h.won === null
                          ? ""
                          : h.won
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {h.won === null
                        ? "-"
                        : h.won
                        ? `+${h.wonAmount! - h.amount}`
                        : `-${h.amount}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
