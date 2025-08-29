type BetChoice = "LIYAMADO" | "DEHADO" | "DRAW";

export default function BetChoicesCard({
  choice,
  tally,
  disabled,
  onClick,
  hideTallyIfDraw = true,
}: {
  choice: BetChoice;
  tally: number;
  disabled: boolean;
  onClick: () => void;
  hideTallyIfDraw?: boolean;
}) {
  const colorMap: Record<BetChoice, string> = {
    LIYAMADO: "bg-red-600 hover:bg-red-700",
    DEHADO: "bg-blue-600 hover:bg-blue-700",
    DRAW: "bg-green-600 hover:bg-green-700",
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={`w-full p-3 rounded-lg text-white font-semibold disabled:opacity-60 ${colorMap[choice]}`}
        disabled={disabled}
      >
        {choice}
      </button>
      {!(hideTallyIfDraw && choice === "DRAW") && (
        <div className="mt-1 text-sm text-gray-600">{tally.toFixed(2)}</div>
      )}
    </div>
  );
}
