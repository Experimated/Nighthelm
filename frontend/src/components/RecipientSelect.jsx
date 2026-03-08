import { useState } from "react";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = ["Boss", "Colleague", "Client", "Friend", "Other"];

const REL_BADGE = {
  Boss: "bg-violet-900/30 text-violet-300",
  Colleague: "bg-blue-900/30 text-blue-300",
  Client: "bg-orange-900/30 text-orange-300",
  Friend: "bg-emerald-900/30 text-emerald-300",
  Other: "bg-zinc-800 text-zinc-400",
};

export default function RecipientSelect({
  title,
  selectedType,
  setSelectedType,
  selectedRecipient,
  setSelectedRecipient,
  recipients = [],
  onContinue,
  onBack,
}) {
  const hasRecipients = recipients.length > 0;
  const [localId, setLocalId] = useState(selectedRecipient?.id || null);

  const handlePick = (r) => {
    setLocalId(r.id);
    setSelectedRecipient({
      id: r.id,
      name: r.name,
      email: r.email,
      relationship: r.relationship,
      addressing_style: r.addressing_style || "first_name",
    });
    setSelectedType(r.relationship);
  };

  const canContinue = hasRecipients ? localId !== null : true;

  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="flex items-center gap-3 pt-4 mb-10">
        <button
          data-testid="btn-back-recipient"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-white mb-2">{title}</h1>
      <p className="text-zinc-400 text-base mb-8">
        {hasRecipients ? "Select who you're writing to." : "Select the relationship type."}
      </p>

      {hasRecipients ? (
        <div className="space-y-2" data-testid="recipient-list">
          {recipients.map((r) => (
            <button
              key={r.id}
              data-testid={`recipient-option-${r.id}`}
              onClick={() => handlePick(r)}
              className={`w-full text-left p-4 rounded-2xl bg-[#18181B] border transition-all active:scale-[0.98] flex items-center justify-between gap-3 ${
                localId === r.id
                  ? "border-indigo-500/60 bg-indigo-500/5"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{r.name}</p>
                <p className="text-zinc-500 text-xs truncate">{r.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    REL_BADGE[r.relationship] || REL_BADGE.Other
                  }`}
                >
                  {r.relationship}
                </span>
                {localId === r.id && (
                  <CheckCircle2 size={16} className="text-indigo-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger
            data-testid="recipient-type-select"
            className="h-14 bg-[#18181B] border border-white/10 text-white rounded-2xl text-base px-4 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <SelectValue placeholder="Select recipient type" />
          </SelectTrigger>
          <SelectContent className="bg-[#18181B] border border-white/10 rounded-2xl">
            {TYPES.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="text-white text-base py-3 focus:bg-white/5 focus:text-white cursor-pointer"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="mt-auto pt-8">
        <button
          data-testid="btn-continue-recipient"
          onClick={() => canContinue && onContinue()}
          disabled={!canContinue}
          className={`w-full h-14 rounded-full text-lg font-medium active:scale-[0.97] transition-all ${
            canContinue
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white btn-glow"
              : "bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
