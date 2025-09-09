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
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Gallera Admin</h1>
        <p className="text-sm text-gray-600 flex items-center gap-1">
        </p>
      </div>

      <div className="flex items-center gap-4">
        <AdminMenu onShowEvent={onShowEvent} onShowFunds={onShowFunds} onLogout={onLogout} />
      </div>
    </header>
  );
}
