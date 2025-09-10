import UserMenu from "./UserMenu";

export default function Header({
  eventName,
  fightNumber,
  onShowHistory,
  onLogout,
}: {
  eventName?: String;
  fightNumber?: number;
  onShowHistory: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Gallera</h1>
        <p className="text-sm text-gray-900 flex items-center gap-1">
          {eventName ?? ""}
        </p>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          Fight #{fightNumber ?? "—"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <UserMenu onShowHistory={onShowHistory} onLogout={onLogout} />
      </div>
    </header>
  );
}
