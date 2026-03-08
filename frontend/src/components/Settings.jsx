import { useState } from "react";
import { ChevronLeft, Mail, Pencil, Trash2, Clock, Plus } from "lucide-react";

function formatTime(time) {
  if (!time) return "7:50 AM";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

const RELATIONSHIP_LABELS = {
  Boss: "bg-violet-900/30 text-violet-300",
  Colleague: "bg-blue-900/30 text-blue-300",
  Client: "bg-orange-900/30 text-orange-300",
  Friend: "bg-emerald-900/30 text-emerald-300",
  Other: "bg-zinc-800 text-zinc-400",
};

export default function Settings({
  recipients,
  sendTime,
  setSendTime,
  senderSettings,
  onSaveSenderSettings,
  onAddRecipient,
  onEditRecipient,
  onDeleteRecipient,
  onBack,
}) {
  const [editingTime, setEditingTime] = useState(false);
  const [localTime, setLocalTime] = useState(sendTime);
  const [senderName, setSenderName] = useState(senderSettings?.sender_name || "");
  const [senderEmail, setSenderEmail] = useState(senderSettings?.sender_email || "");

  const handleSaveTime = () => {
    setSendTime(localTime);
    setEditingTime(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-8">
        <button
          data-testid="btn-back-settings"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Recipients section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-zinc-300 uppercase tracking-widest text-xs">
              Recipients
            </h2>
            <button
              data-testid="btn-add-recipient"
              onClick={onAddRecipient}
              className="flex items-center gap-1.5 text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
            >
              <Plus size={15} />
              Add
            </button>
          </div>

          {recipients.length === 0 ? (
            <div className="bg-[#18181B] border border-white/5 rounded-3xl p-6 text-center">
              <Mail size={28} className="mx-auto mb-2 text-zinc-600" />
              <p className="text-zinc-500 text-sm">No recipients yet.</p>
              <button
                data-testid="btn-add-first-recipient"
                onClick={onAddRecipient}
                className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
              >
                Add your first recipient
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recipients.map((r) => (
                <div
                  key={r.id}
                  data-testid={`recipient-item-${r.id}`}
                  className="bg-[#18181B] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-sm font-medium truncate">{r.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          RELATIONSHIP_LABELS[r.relationship] || RELATIONSHIP_LABELS.Other
                        }`}
                      >
                        {r.relationship}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs truncate">{r.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      data-testid={`btn-edit-recipient-${r.id}`}
                      onClick={() => onEditRecipient(r)}
                      className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      data-testid={`btn-delete-recipient-${r.id}`}
                      onClick={() => onDeleteRecipient(r.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Morning send settings */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-3">
            Morning send settings
          </h2>
          <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Clock size={14} />
                <span>Default send time</span>
              </div>
              <button
                data-testid="btn-change-send-time"
                onClick={() => setEditingTime(!editingTime)}
                className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
              >
                Change time
              </button>
            </div>

            {editingTime ? (
              <div className="mt-3 flex items-center gap-3">
                <input
                  data-testid="input-settings-time"
                  type="time"
                  value={localTime}
                  onChange={(e) => setLocalTime(e.target.value)}
                  className="flex-1 bg-[#0A0A0B] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base"
                />
                <button
                  data-testid="btn-save-time"
                  onClick={handleSaveTime}
                  className="bg-indigo-600 rounded-xl px-4 py-2.5 text-white text-sm font-medium hover:bg-indigo-500 active:scale-[0.97] transition-all"
                >
                  Save
                </button>
              </div>
            ) : (
              <p data-testid="display-settings-time" className="text-white text-xl font-semibold mt-1">
                {formatTime(sendTime)}
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Timezone</span>
              <span className="text-zinc-300 text-sm">Automatic</span>
            </div>
          </div>
        </section>

        {/* Sender identity */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-3">
            Sender identity
          </h2>
          <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5 space-y-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">Your name</label>
              <input
                data-testid="input-sender-name"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">Your email (optional)</label>
              <input
                data-testid="input-sender-email"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. john@company.com"
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
            <button
              data-testid="btn-save-sender"
              onClick={() => onSaveSenderSettings({ sender_name: senderName, sender_email: senderEmail })}
              className="w-full h-10 rounded-full bg-indigo-600/30 text-indigo-300 text-sm font-medium border border-indigo-600/30 hover:bg-indigo-600/40 active:scale-[0.97] transition-all"
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
