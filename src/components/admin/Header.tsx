import AdminMenu from "@/components/admin/AdminMenu";

export default function Header({
  onShowEvent,
  onShowFunds,
  onLogout,
}: {
  onShowEvent: () => void;
  onShowFunds: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="flex items-center justify-between py-3 px-2 border-b border-gray-200 rounded-xl shadow-sm  bg-gray-100">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          🐓 Gallera
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <AdminMenu
          onShowEvent={onShowEvent}
          onShowFunds={onShowFunds}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
