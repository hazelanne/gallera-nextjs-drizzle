import UserMenu from "./UserMenu";

export default function Header({
  onShowHistory,
  onLogout,
}: {
  onShowHistory: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Gallera</h1>
      </div>

      <div className="flex items-center gap-4">
        <UserMenu onShowHistory={onShowHistory} onLogout={onLogout} />
      </div>
    </header>
  );
}
