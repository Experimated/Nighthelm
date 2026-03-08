import { ChevronLeft } from "lucide-react";

export default function FlowBWrite({ inputMessage, setInputMessage, onAnalyze, onBack }) {
  const charCount = inputMessage.trim().length;

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-8">
        <button
          data-testid="btn-back-write"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-white mb-2">Write your message</h1>
      <p className="text-zinc-400 text-base mb-6">Paste or type the message you want to check.</p>

      {/* Textarea */}
      <div className="flex-1">
        <textarea
          data-testid="input-message-textarea"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Hey sorry I can't come tomorrow morning something happened"
          rows={8}
          className="w-full bg-[#18181B] border border-white/10 rounded-2xl p-4 text-white text-base placeholder:text-zinc-600 resize-none focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 leading-relaxed transition-all"
        />
        {charCount > 0 && (
          <p className="text-zinc-600 text-xs mt-2 text-right">{charCount} characters</p>
        )}
      </div>

      {/* Check button */}
      <div className="pt-6">
        <button
          data-testid="btn-check-message"
          onClick={() => charCount > 0 && onAnalyze()}
          disabled={charCount === 0}
          className={`w-full h-14 rounded-full text-lg font-medium transition-all active:scale-[0.97] ${
            charCount > 0
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white btn-glow"
              : "bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
          }`}
        >
          Check it
        </button>
      </div>
    </div>
  );
}
