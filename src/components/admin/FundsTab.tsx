import { useEffect, useState } from "react";

interface TodaySummary {
  todayInflow: string;
  todayOutflow: string;
  todayNet: string;
}

interface OverallSummary {
  totalInflow: string;
  totalOutflow: string;
  net: string;
}

interface FundsSummary {
  today: TodaySummary;
  overall: OverallSummary;
}

export default function FundsTab() {
  const [summary, setSummary] = useState<FundsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunds() {
      try {
        const res = await fetch("/api/treasury");
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch house funds:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFunds();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading funds…</p>;
  }

  if (!summary) {
    return <p className="text-red-500">Failed to load funds summary.</p>;
  }

  const renderBlock = (
    label: string,
    inflow: string,
    outflow: string,
    net: string
  ) => {
    const netValue = parseFloat(net);

    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{label}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white shadow rounded-lg">
            <p className="text-gray-500">Inflow</p>
            <p className="text-2xl font-bold">{parseFloat(inflow).toFixed(2)}</p>
          </div>

          <div className="p-4 bg-white shadow rounded-lg">
            <p className="text-gray-500">Outflow</p>
            <p className="text-2xl font-bold">
              {parseFloat(outflow).toFixed(2)}
            </p>
          </div>

          <div
            className={`p-4 shadow rounded-lg ${
              netValue >= 0 ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <p className="text-gray-500">Net</p>
            <p
              className={`text-2xl font-bold ${
                netValue >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {netValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Funds Summary</h2>
      {renderBlock(
        "Today",
        summary.today.todayInflow,
        summary.today.todayOutflow,
        summary.today.todayNet
      )}
      {renderBlock(
        "Overall",
        summary.overall.totalInflow,
        summary.overall.totalOutflow,
        summary.overall.net
      )}
    </div>
  );
}
