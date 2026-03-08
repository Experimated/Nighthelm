import { useState } from "react";
import { ChevronLeft, Mail, Pencil, Trash2, Clock, Plus } from "lucide-react";

function formatTime(time) {
  if (!time) return "7:40 AM";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatSendTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const RELATIONSHIP_LABELS = {
  Boss: "bg-violet-900/30 text-violet-300",
  Colleague: "bg-blue-900/30 text-blue-300",
  Client: "bg-orange-900/30 text-orange-300",
  Friend: "bg-emerald-900/30 text-emerald-300",
  Other: "bg-zinc-800 text-zinc-400",
};

export default function ScheduledMessages({ messages, onCancelOne, onCancelAll, onDeleteSent, onBack }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const pending = messages
    .filter((m) => ["scheduled", "pending"].includes(m.status))
    .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));

  const sent = messages
    .filter((m) => m.status === "sent")
    .sort((a, b) => new Date(b.sent_at || b.created_at) - new Date(a.sent_at || a.created_at));

  const handleCancelAll = async () => {
    await onCancelAll();
    setShowConfirm(false);
    onBack();
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-8">
        <button
          data-testid="btn-back-scheduled"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-white">Scheduled morning qeue</h1>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Pending section */}
        <section>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
            Pending ({pending.length})
          </p>
          {pending.length === 0 ? (
            <p className="text-zinc-600 text-sm py-2">No pending messages.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((msg) => (
                <div
                  key={msg.id}
                  data-testid={`message-card-${msg.id}`}
                  className="bg-[#18181B] border border-white/5 rounded-3xl p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Mail size={13} />
                        <span className="truncate">{msg.recipient_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-indigo-400">
                        <Clock size={13} />
                        <span>{formatSendTime(msg.scheduled_for)}</span>
                      </div>
                      <p className="text-white text-sm font-medium truncate">{msg.subject}</p>
                    </div>
                    <button
                      data-testid={`btn-cancel-message-${msg.id}`}
                      onClick={() => onCancelOne(msg.id)}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-red-400 bg-red-950/30 border border-red-900/30 rounded-full px-3 py-1.5 hover:bg-red-950/50 active:scale-[0.97] transition-all"
                    >
                      <Trash2 size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sent history section */}
        {sent.length > 0 && (
          <section>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
              Sent history ({sent.length})
            </p>
            <div className="space-y-3">
              {sent.map((msg) => (
                <div
                  key={msg.id}
                  data-testid={`sent-card-${msg.id}`}
                  className="bg-[#18181B] border border-white/5 rounded-3xl p-5 opacity-70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Mail size={13} />
                        <span className="truncate">{msg.recipient_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Clock size={13} />
                        <span>{formatSendTime(msg.sent_at || msg.scheduled_for)}</span>
                      </div>
                      <p className="text-zinc-300 text-sm font-medium truncate">{msg.subject}</p>
                    </div>
                    <button
                      data-testid={`btn-delete-sent-${msg.id}`}
                      onClick={() => onDeleteSent(msg.id)}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-800/50 border border-zinc-700/30 rounded-full px-3 py-1.5 hover:text-red-400 hover:bg-red-950/30 active:scale-[0.97] transition-all"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom actions */}
      <div className="pt-6 space-y-3">
        {pending.length > 0 && (
          <>
            {showConfirm ? (
              <div className="bg-[#18181B] border border-white/10 rounded-3xl p-5 space-y-3">
                <p className="text-white text-sm font-medium text-center">
                  Cancel all {pending.length} pending message{pending.length > 1 ? "s" : ""}?
                </p>
                <div className="flex gap-2">
                  <button
                    data-testid="btn-confirm-cancel-all"
                    onClick={handleCancelAll}
                    className="flex-1 h-11 rounded-full bg-red-900/40 text-red-400 border border-red-900/40 text-sm font-medium active:scale-[0.97] transition-all"
                  >
                    Yes, cancel all
                  </button>
                  <button
                    data-testid="btn-keep-messages"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 h-11 rounded-full bg-transparent border border-white/10 text-zinc-300 text-sm font-medium active:scale-[0.97] transition-all"
                  >
                    Keep them
                  </button>
                </div>
              </div>
            ) : (
              <button
                data-testid="btn-cancel-all-messages"
                onClick={() => setShowConfirm(true)}
                className="w-full h-14 rounded-full bg-red-950/40 text-red-400 border border-red-900/40 text-base font-medium active:scale-[0.97] transition-all hover:bg-red-950/60"
              >
                Cancel all scheduled
              </button>
            )}
          </>
        )}

        <button
          data-testid="btn-back-bottom"
          onClick={onBack}
          className="w-full h-14 rounded-full bg-[#18181B] border border-white/5 text-zinc-300 text-base font-medium active:scale-[0.97] transition-all hover:border-white/10"
        >
          Back
        </button>
      </div>
    </div>
  );
}
