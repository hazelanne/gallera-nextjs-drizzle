import { Menu, Swords, Landmark, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminMenuProps {
  onShowEvent: () => void;
  onShowFunds: () => void;
  onLogout: () => void;
}

export default function AdminMenu({onShowEvent, onShowFunds, onLogout} : AdminMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 flex items-center justify-center rounded-full hover:bg-gray-100">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onShowEvent}>
          <Swords className="w-4 h-4 mr-2" /> Event
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShowFunds}>
          <Landmark className="w-4 h-4 mr-2" /> Funds
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
