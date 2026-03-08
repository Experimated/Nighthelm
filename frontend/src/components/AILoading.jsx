import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Analyzing situation",
  "Preparing safe responses",
  "Almost ready",
];

export default function AILoading({ title = "Preparing responses" }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      data-testid="ai-loading-screen"
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      {/* Animated glow ring */}
      <div className="relative w-28 h-28 mb-10">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 opacity-15 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 opacity-30 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.5)]">
          <Sparkles size={26} className="text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-white mb-8 text-center">{title}</h2>

      <div className="space-y-4 w-full max-w-xs">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 transition-all duration-500 ${
              i <= step ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                i < step ? "bg-indigo-400" : "bg-indigo-500 animate-pulse"
              }`}
            />
            <span className="text-zinc-400 text-base">{s}…</span>
          </div>
        ))}
      </div>
    </div>
  );
}
