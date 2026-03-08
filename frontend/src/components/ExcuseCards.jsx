import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const LABEL_STYLES = {
  Safe: "bg-emerald-900/40 text-emerald-400 border border-emerald-900/50",
  Neutral: "bg-blue-900/40 text-blue-400 border border-blue-900/50",
  Direct: "bg-orange-900/40 text-orange-400 border border-orange-900/50",
};

export default function ExcuseCards({ excuses, onSelect, onRetry, onBack }) {
  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-10">
        <button
          data-testid="btn-back-excuses"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-white mb-2">Choose your message</h1>
      <p className="text-zinc-400 text-sm mb-6">Tap a card to review and schedule it.</p>

      {/* Cards */}
      <div className="space-y-3 flex-1">
        {excuses.map((excuse, idx) => (
          <button
            key={idx}
            data-testid={`excuse-card-${idx}`}
            onClick={() => onSelect(excuse)}
            className="w-full text-left p-5 rounded-3xl bg-[#18181B] border border-white/5 hover:border-indigo-500/40 active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  LABEL_STYLES[excuse.label] || LABEL_STYLES.Neutral
                }`}
              >
                {excuse.label}
              </span>
              <ChevronRight
                size={16}
                className="text-zinc-600 group-hover:text-indigo-400 transition-colors"
              />
            </div>
            <p className="text-sm font-medium text-zinc-200 mb-1.5">{excuse.subject}</p>
            <p className="text-sm text-zinc-500 leading-relaxed">{excuse.body}</p>
          </button>
        ))}
      </div>

      {/* Bottom buttons */}
      <div className="pt-6 space-y-3">
        <button
          data-testid="btn-gimme-another"
          onClick={onRetry}
          className="w-full h-14 rounded-full bg-[#18181B] border border-white/10 text-zinc-300 text-base font-medium active:scale-[0.97] transition-all hover:border-indigo-500/30 flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Show 3 more
        </button>
      </div>
    </div>
  );
}
