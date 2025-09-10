type BetChoice = "LIYAMADO" | "DEHADO" | "DRAW";

export default function BetChoicesCard({
  choice,
  tally,
  disabled,
  onClick,
}: {
  choice: BetChoice;
  tally: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const buttonColorMap: Record<BetChoice, string> = {
    LIYAMADO: "bg-red-600 hover:bg-red-700",
    DEHADO: "bg-blue-600 hover:bg-blue-700",
    DRAW: "bg-green-600 hover:bg-green-700",
  };

  const tallyTextColorMap: Record<BetChoice, string> = {
    LIYAMADO: "text-red-600",
    DEHADO: "text-blue-600",
    DRAW: "text-green-700",
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={`w-full p-3 rounded-2xl shadow text-white font-semibold disabled:opacity-60 text-xs sm:text-sm md:text-base ${buttonColorMap[choice]}`}
        disabled={disabled}
      >
        {choice}
      </button>
      {!(choice === "DRAW") && (
        <div
          className={`mt-1 text-sm font-semibold ${tallyTextColorMap[choice]}`}
        >
          {tally.toFixed(2)}
        </div>
      )}
    </div>
  );
}
