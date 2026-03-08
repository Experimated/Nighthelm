import { useState } from "react";
import { ChevronLeft } from "lucide-react";

const REASONS = [
  "not feeling well",
  "family issue",
  "transport problem",
  "need to reschedule",
  "unexpected situation",
  "running late",
  "personal matter",
];

export default function FlowAReasons({ selectedType, usedReasons, onGenerate, onBack }) {
  const [selected, setSelected] = useState("");

  const handleChip = (reason) => {
    if (usedReasons.includes(reason)) return;
    setSelected((prev) => (prev === reason ? "" : reason));
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-10">
        <button
          data-testid="btn-back-reasons"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold text-white mb-2">Why can't you make it?</h1>
      <p className="text-zinc-400 text-base mb-8">Pick what best describes the situation.</p>

      {/* Chips */}
      <div className="flex flex-wrap gap-2.5">
        {REASONS.map((reason) => {
          const isUsed = usedReasons.includes(reason);
          const isSelected = selected === reason;

          return (
            <button
              key={reason}
              data-testid={`chip-${reason.replace(/\s+/g, "-")}`}
              onClick={() => handleChip(reason)}
              disabled={isUsed}
              title={isUsed ? "You already used this reason with this recipient." : ""}
              aria-disabled={isUsed}
              className={`rounded-full px-4 py-2.5 text-sm font-medium border transition-all ${
                isUsed
                  ? "border-white/5 text-zinc-600 bg-zinc-900/30 cursor-not-allowed"
                  : isSelected
                  ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                  : "border-white/10 text-zinc-300 hover:border-indigo-400/40 hover:text-white active:scale-[0.97]"
              }`}
            >
              {reason}
            </button>
          );
        })}
      </div>

      {/* Info for used reasons */}
      {usedReasons.length > 0 && (
        <p className="text-xs text-zinc-600 mt-4">
          Greyed out reasons were already used for {selectedType}.
        </p>
      )}

      {/* Generate button */}
      <div className="mt-auto pt-8">
        <button
          data-testid="btn-show-excuses"
          onClick={() => selected && onGenerate(selected)}
          disabled={!selected}
          className={`w-full h-14 rounded-full text-lg font-medium transition-all active:scale-[0.97] ${
            selected
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white btn-glow"
              : "bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
          }`}
        >
          Show 3 excuses
        </button>
      </div>
    </div>
  );
}
