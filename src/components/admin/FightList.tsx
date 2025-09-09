import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fight, Team } from "@/components/admin/types";

interface FightListProps {
  fights: Fight[],
  teams: Team[],
  page: number,
  hasMore: boolean,
  onPageChange: (page: number) => void;
}

export default function FightList({ fights, teams, page, hasMore, onPageChange } : FightListProps) {
  const teamsMap = useMemo(() => {
    return Object.fromEntries(
      teams.map(team => [team.id, team])
    );
  }, [teams]);

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2 text-sm font-medium text-red-600">Liyamado</th>
              <th className="px-4 py-2 text-sm font-medium text-blue-600">Dehado</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[...fights]
              .sort((a, b) => {
                const activeStatuses = ["OPEN", "STARTED"];
                const aActive = activeStatuses.includes(a.status);
                const bActive = activeStatuses.includes(b.status);

                if (aActive && !bActive) return -1;
                if (!aActive && bActive) return 1;

                return b.id - a.id;
              })
              .slice(0, 10)
              .map((fight) => {
                let resultEl: React.ReactNode;

                if (fight.status === "cancelled") {
                  resultEl = (
                    <span className="inline-block px-2 py-1 text-xs rounded bg-gray-300 text-gray-700">
                      CANCELLED
                    </span>
                  );
                } else if (fight.status === "closed" && fight.winningSide) {
                  if (fight.winningSide === "DRAW") {
                    resultEl = (
                      <span className="font-semibold text-green-600">DRAW</span>
                    );
                  } else if (fight.winningSide === "LIYAMADO") {
                    resultEl = (
                      <span className="font-semibold text-red-600">LIYAMADO</span>
                    );
                  } else if (fight.winningSide === "DEHADO") {
                    resultEl = (
                      <span className="font-semibold text-blue-600">DEHADO</span>
                    );
                  }
                } else {
                  resultEl = <span className="text-gray-400">–</span>;
                }

                return (
                  <tr key={fight.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 font-medium">
                      { fight.fightNumber }
                    </td>
                    <td className="px-4 py-2 font-medium text-red-600">
                      { teamsMap[fight.aTeamId]?.name }
                    </td>
                    <td className="px-4 py-2 font-medium text-blue-600">
                      { teamsMap[fight.bTeamId]?.name }
                    </td>
                    <td className="px-4 py-2">{resultEl}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          <ChevronLeft />
        </button>

        <span className="text-sm text-gray-600">Page {page + 1}</span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}
