import UserMenu from "./UserMenu";

export default function Header({
  onShowHistory,
  onLogout,
}: {
  onShowHistory: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="flex items-center justify-between py-3 px-2 border-b border-gray-200 rounded-xl shadow-sm  bg-gray-100">
      {/* Logo / App Name */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          🐓 Gallera
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <UserMenu onShowHistory={onShowHistory} onLogout={onLogout} />
      </div>
    </header>
  );
}
