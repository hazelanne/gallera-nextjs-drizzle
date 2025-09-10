import { useState } from "react";

export default function BetAmountModal({
  choice,
  balance,
  onConfirm,
  onClose,
}: {
  choice: "LIYAMADO" | "DEHADO" | "DRAW";
  balance: number;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-6 w-80 space-y-4">
        <h2 className="text-lg font-bold text-center">
          Place Bet on{" "}
          <span
            className={
              choice === "LIYAMADO"
                ? "text-red-600"
                : choice === "DEHADO"
                ? "text-blue-600"
                : "text-green-600"
            }
          >
            {choice}
          </span>
        </h2>

        <input
          className="w-full border p-2 rounded text-right"
          type="number"
          min={0}
          max={balance}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Enter amount"
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(amount)}
            className={`px-4 py-2 rounded-lg text-white ${
              choice === "LIYAMADO"
                ? "bg-red-600 hover:bg-red-700"
                : choice === "DEHADO"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
