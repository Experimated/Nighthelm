import { ChevronLeft } from "lucide-react";

const CHAR_TYPE = {
  good: { dot: "bg-emerald-500", text: "text-emerald-400", badge: "bg-emerald-900/30 text-emerald-400 border border-emerald-900/40" },
  neutral: { dot: "bg-yellow-500", text: "text-yellow-400", badge: "bg-yellow-900/30 text-yellow-400 border border-yellow-900/40" },
  bad: { dot: "bg-red-500", text: "text-red-400", badge: "bg-red-900/30 text-red-400 border border-red-900/40" },
};

const RISK_DOT_COLOR = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  green: "bg-emerald-500",
};

export default function FlowBAnalysis({ analysisResult, onUseSafer, onUseShorter, onEdit, onBack }) {
  if (!analysisResult) return null;

  const { risk_score, risk_label, risk_color, characteristics, safer_version, shorter_version } = analysisResult;
  const dotColor = RISK_DOT_COLOR[risk_color] || "bg-zinc-500";

  const riskLabelColor =
    risk_color === "red"
      ? "text-red-400"
      : risk_color === "orange"
      ? "text-orange-400"
      : "text-emerald-400";

  return (
    <div className="min-h-screen flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-8">
        <button
          data-testid="btn-back-analysis"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-white">Message check</h1>
      </div>

      {/* Safety indicator */}
      <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              data-testid={`risk-dot-${i}`}
              className={`w-4 h-4 rounded-full transition-all ${i <= risk_score ? dotColor : "bg-zinc-800"}`}
            />
          ))}
        </div>
        <p data-testid="risk-label" className={`text-lg font-semibold ${riskLabelColor}`}>
          {risk_label}
        </p>
      </div>

      {/* Characteristics */}
      <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5 mb-4">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-4">
          Characteristics
        </p>
        <div className="space-y-3">
          {characteristics.map((c, i) => {
            const style = CHAR_TYPE[c.type] || CHAR_TYPE.neutral;
            return (
              <div key={i} data-testid={`char-${i}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className="text-zinc-300 text-sm">{c.name}</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.badge}`}>
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested improvements */}
      <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5 mb-6">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-4">
          Suggested improvements
        </p>

        {/* Option 1 — Safer */}
        <div className="mb-4 pb-4 border-b border-white/5">
          <p className="text-white text-sm font-medium mb-1">Option 1 — Safer version</p>
          <p className="text-zinc-500 text-sm leading-relaxed mb-3">{safer_version.body}</p>
          <button
            data-testid="btn-use-safer"
            onClick={onUseSafer}
            className="w-full h-11 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium active:scale-[0.97] transition-all btn-glow"
          >
            Use safer version
          </button>
        </div>

        {/* Option 2 — Shorter */}
        <div>
          <p className="text-white text-sm font-medium mb-1">Option 2 — Shorter version</p>
          <p className="text-zinc-500 text-sm leading-relaxed mb-3">{shorter_version.body}</p>
          <button
            data-testid="btn-use-shorter"
            onClick={onUseShorter}
            className="w-full h-11 rounded-full bg-[#0A0A0B] border border-white/10 text-zinc-300 text-sm font-medium active:scale-[0.97] transition-all hover:border-indigo-500/30"
          >
            Use shorter version
          </button>
        </div>
      </div>

      {/* Edit text */}
      <button
        data-testid="btn-edit-text"
        onClick={onEdit}
        className="w-full h-12 rounded-full border border-white/10 text-zinc-400 text-sm font-medium active:scale-[0.97] transition-all hover:border-white/20 hover:text-zinc-300"
      >
        Edit text
      </button>
    </div>
  );
}
