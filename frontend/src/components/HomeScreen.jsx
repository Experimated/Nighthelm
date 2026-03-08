import { MessageSquare, ScanText, Settings as SettingsIcon, X } from "lucide-react";

export default function HomeScreen({ scheduledMessages, onStartFlowA, onStartFlowB, onSettings, onCancelAll }) {
  const hasMessages = scheduledMessages.length > 0;
  const count = scheduledMessages.length;

  return (
    <div className="min-h-screen flex flex-col p-6 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-10 pb-8 relative text-center">
        <h1 className="text-5xl font-bold gradient-text tracking-tight leading-tight">
          NightHelm
        </h1>
        <p className="text-zinc-400 mt-2 text-base leading-relaxed">
          Late night protection for your reputation.
        </p>
      </div>

      {/* Bento grid */}
      <div className="flex flex-col gap-4 relative">
        {/* Primary — 3 Excuses */}
        <button
          data-testid="btn-3-excuses"
          onClick={onStartFlowA}
          className="w-full h-24 rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white flex items-center justify-center gap-3 active:scale-[0.97] transition-all btn-glow"
        >
          <MessageSquare size={26} strokeWidth={2} />
          <span className="text-xl font-semibold">3 Excuses</span>
        </button>

        {/* Secondary row */}
        <div className="grid grid-cols-2 gap-4">
          <button
            data-testid="btn-check-text"
            onClick={onStartFlowB}
            className="h-24 rounded-3xl bg-[#18181B] border border-white/5 text-white flex flex-col items-center justify-center gap-2 active:scale-[0.97] transition-all hover:border-indigo-500/30"
          >
            <ScanText size={22} className="text-indigo-400" strokeWidth={2} />
            <span className="text-base font-medium">Review my message</span>
          </button>

          <button
            data-testid="btn-settings"
            onClick={onSettings}
            className="h-24 rounded-3xl bg-[#18181B] border border-white/5 text-white flex flex-col items-center justify-center gap-2 active:scale-[0.97] transition-all hover:border-indigo-500/30"
          >
            <SettingsIcon size={22} className="text-zinc-400" strokeWidth={2} />
            <span className="text-base font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Cancel all */}
      <div className="mt-auto pt-8 space-y-3">
        <button
          data-testid="btn-cancel-all"
          onClick={() => hasMessages && onCancelAll()}
          disabled={!hasMessages}
          className={`w-full h-14 rounded-full text-base font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2 ${
            hasMessages
              ? "bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-950/60"
              : "bg-zinc-900/50 text-zinc-600 border border-zinc-800/50 cursor-not-allowed"
          }`}
        >
          <X size={16} />
          View Scheduled
        </button>

        <p data-testid="scheduled-count" className="text-center text-zinc-600 text-sm">
          {hasMessages
            ? `${count} email${count > 1 ? "s" : ""} waiting`
            : "No scheduled emails"}
        </p>
      </div>
    </div>
  );
}
