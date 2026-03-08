import { useEffect, useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";

const SURVIVAL_PLAN = [
  "Drink water",
  "Check your calendar",
  "Send follow-up later if needed",
  "Prepare explanation",
];

function formatTime(time) {
  if (!time) return "7:50 AM";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function Confirmation({ reviewData, sendTime, selectedRecipient, onDone }) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDone]);

  const recipientEmail = selectedRecipient?.email || "recipient@example.com";

  return (
    <div
      data-testid="confirmation-screen"
      className="min-h-screen flex flex-col p-6"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Success icon */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(124,58,237,0.4)]">
          <CheckCircle2 size={36} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Message scheduled</h1>
        <p className="text-zinc-400 text-base mb-2">
          Your message will be sent at{" "}
          <span className="text-white font-medium">{formatTime(sendTime)}</span>.
        </p>

        <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6">
          <Mail size={13} />
          <span data-testid="confirmation-recipient">{recipientEmail}</span>
        </div>

        <p className="text-zinc-600 text-xs">
          You can cancel it anytime from the home screen.
        </p>
      </div>

      {/* Survival plan */}
      <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5 mb-6">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-4">
          Tomorrow survival plan
        </p>
        <ul className="space-y-2.5">
          {SURVIVAL_PLAN.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Countdown + button */}
      <div className="space-y-3">
        <button
          data-testid="btn-go-home"
          onClick={onDone}
          className="w-full h-14 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-lg font-medium active:scale-[0.97] transition-all btn-glow"
        >
          Back to home
        </button>
        <p className="text-center text-zinc-600 text-sm">
          Returning to home in {countdown}s…
        </p>
      </div>
    </div>
  );
}
