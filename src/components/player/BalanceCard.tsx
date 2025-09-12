import { Wallet } from "lucide-react";

export default function BalanceCard({ balance }: { balance: number | string }) {
  return (
    <div className="grid grid-cols-3 gap-4 pb-2">
      <div className="col-span-1">
        <div className="py-2 flex items-center gap-3">
          <div className="text-left flex-1">
            <div className="flex gap-2 items-center">
              <Wallet className="w-4 h-4 text-gray-500" />
              <div className="text-xs text-gray-500">Balance</div>
            </div>
            <div className="text-3xl font-bold text-yellow-800">
              {typeof balance === "number" ? balance.toFixed(2) : balance}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
