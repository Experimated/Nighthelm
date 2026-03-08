import { useState } from "react";
import { ChevronLeft, Clock, Mail, Pencil, Check, Settings } from "lucide-react";
import { toast } from "sonner";

function clampToWindow(time) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m;
  if (total < 360) return "06:00";
  if (total > 780) return "13:00";
  return time;
}

function formatTime(time) {
  if (!time) return "7:50 AM";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function ReviewMessage({
  reviewData,
  setReviewData,
  sendTime,
  setSendTime,
  selectedRecipient,
  setSelectedRecipient,
  recipients,
  currentFlow,
  onSend,
  onBack,
  onSettings,
}) {
  const [editingTime, setEditingTime] = useState(false);
  const [editingRecipient, setEditingRecipientLocal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const [manualEmail, setManualEmail] = useState(selectedRecipient?.email || "");
  const [manualName, setManualName] = useState(selectedRecipient?.name || "");

  const handleSaveTime = (val) => {
    const clamped = clampToWindow(val);
    if (clamped !== val) {
      toast.info("Time adjusted to the 6 AM – 1 PM send window.");
    }
    setSendTime(clamped);
    setEditingTime(false);
  };

  const handleSaveRecipient = () => {
    setSelectedRecipient({ name: manualName, email: manualEmail });
    setEditingRecipientLocal(false);
  };

  const handleSelectSavedRecipient = (r) => {
    setSelectedRecipient({ name: r.name, email: r.email });
    setManualEmail(r.email);
    setManualName(r.name);
    setEditingRecipientLocal(false);
  };

  const handleSaveMessage = () => {
    setEditingMessage(false);
  };

  const recipientDisplay = selectedRecipient?.email || "Add recipient email";

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-8">
        <button
          data-testid="btn-back-review"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-white">Review message</h1>
      </div>

      <div className="flex-1 space-y-4">
        {/* Send time */}
        <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Clock size={14} />
              <span>Send time</span>
            </div>
            <button
              data-testid="btn-change-time"
              onClick={() => setEditingTime(!editingTime)}
              className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
            >
              Change time
            </button>
          </div>
          {editingTime ? (
            <div className="flex items-center gap-3 mt-2">
              <input
                data-testid="input-send-time"
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                className="bg-[#0A0A0B] border border-white/10 rounded-xl px-3 py-2 text-white text-base flex-1"
              />
              <button
                onClick={() => handleSaveTime(sendTime)}
                className="bg-indigo-600 rounded-xl p-2 text-white"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <p data-testid="display-send-time" className="text-white text-xl font-semibold mt-1">
              {formatTime(sendTime)}
            </p>
          )}
        </div>

        {/* Recipient */}
        <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Mail size={14} />
              <span>To</span>
            </div>
            <button
              data-testid="btn-change-recipient"
              onClick={() => setEditingRecipientLocal(!editingRecipient)}
              className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
            >
              Change recipient
            </button>
          </div>

          {editingRecipient ? (
            <div className="mt-3 space-y-2">
              {recipients.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {recipients.map((r) => (
                    <button
                      key={r.id}
                      data-testid={`select-recipient-${r.id}`}
                      onClick={() => handleSelectSavedRecipient(r)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-[#0A0A0B] border border-white/5 hover:border-indigo-500/30 transition-all"
                    >
                      <p className="text-white text-sm font-medium">{r.name}</p>
                      <p className="text-zinc-500 text-xs">{r.email}</p>
                    </button>
                  ))}
                </div>
              )}
              <input
                data-testid="input-recipient-name"
                type="text"
                placeholder="Name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base placeholder:text-zinc-600"
              />
              <input
                data-testid="input-recipient-email"
                type="email"
                placeholder="Email address"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base placeholder:text-zinc-600"
              />
              <button
                onClick={handleSaveRecipient}
                className="w-full h-10 rounded-full bg-indigo-600/30 text-indigo-300 text-sm font-medium border border-indigo-600/30 hover:bg-indigo-600/40 active:scale-[0.97] transition-all"
              >
                Save
              </button>
            </div>
          ) : (
            <p data-testid="display-recipient-email" className="text-white text-base font-medium mt-1 break-all">
              {recipientDisplay}
            </p>
          )}
        </div>

        {/* Message preview */}
        <div className="bg-[#18181B] border border-white/5 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Message preview</span>
            <button
              data-testid="btn-edit-message"
              onClick={() => setEditingMessage(!editingMessage)}
              className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <Pencil size={13} />
              Edit
            </button>
          </div>

          {editingMessage ? (
            <div className="space-y-2">
              <input
                data-testid="input-edit-subject"
                type="text"
                value={reviewData.subject}
                onChange={(e) => setReviewData({ ...reviewData, subject: e.target.value })}
                placeholder="Subject"
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base placeholder:text-zinc-600"
              />
              <textarea
                data-testid="input-edit-body"
                value={reviewData.body}
                onChange={(e) => setReviewData({ ...reviewData, body: e.target.value })}
                rows={4}
                placeholder="Message body"
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base placeholder:text-zinc-600 resize-none"
              />
              <button
                onClick={handleSaveMessage}
                className="w-full h-10 rounded-full bg-indigo-600/30 text-indigo-300 text-sm font-medium border border-indigo-600/30 hover:bg-indigo-600/40 active:scale-[0.97] transition-all"
              >
                Done editing
              </button>
            </div>
          ) : (
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">Subject</p>
              <p data-testid="display-subject" className="text-white font-medium mb-3">{reviewData.subject}</p>
              <p className="text-zinc-400 text-xs mb-0.5">Body</p>
              <p data-testid="display-body" className="text-zinc-300 text-sm leading-relaxed">{reviewData.body}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="pt-6 space-y-3">
        <button
          data-testid="btn-send-message"
          onClick={onSend}
          className="w-full h-14 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-lg font-medium active:scale-[0.97] transition-all btn-glow"
        >
          Send at {formatTime(sendTime)}
        </button>

        <button
          data-testid="btn-settings-link"
          onClick={onSettings}
          className="w-full text-center text-zinc-500 text-sm hover:text-zinc-400 py-2 transition-colors flex items-center justify-center gap-1"
        >
          <Settings size={13} />
          Settings
        </button>
      </div>
    </div>
  );
}
