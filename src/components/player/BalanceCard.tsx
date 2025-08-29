import { Wallet } from "lucide-react";

export default function BalanceCard({ value }: { value: number | string }) {
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
