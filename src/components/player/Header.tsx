import { Signal } from "lucide-react";
import BalanceCard from "@/components/player/BalanceCard";
import UserMenu from "./UserMenu";

export default function Header({
  balance,
  fightId,
  connectionStatus,
  onShowHistory,
  onLogout,
}: {
  balance: number;
  fightId?: number;
  connectionStatus: "connected" | "disconnected" | "connecting";
  onShowHistory: () => void;
  onLogout: () => void;
}) {
  const statusColors: Record<typeof connectionStatus, string> = {
    connected: "text-green-600",
    connecting: "text-yellow-600",
    disconnected: "text-red-600",
  };

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Gallera</h1>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          Fight #{fightId ?? "—"} ·{" "}
          <Signal className={`w-4 h-4 ${statusColors[connectionStatus]}`} />
          <span className={statusColors[connectionStatus]}>{connectionStatus}</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <BalanceCard value={balance} />
        <UserMenu onShowHistory={onShowHistory} onLogout={onLogout} />
      </div>
    </header>
  );
}
