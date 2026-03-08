import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RELATIONSHIPS = ["Boss", "Colleague", "Client", "Friend", "Other"];

export default function AddRecipient({ editingRecipient, onSave, onBack }) {
  const [name, setName] = useState(editingRecipient?.name || "");
  const [email, setEmail] = useState(editingRecipient?.email || "");
  const [relationship, setRelationship] = useState(editingRecipient?.relationship || "Colleague");

  const isEditing = !!editingRecipient;
  const canSave = name.trim() && email.trim() && email.includes("@");

  const handleSave = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), email: email.trim(), relationship });
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-8">
        <button
          data-testid="btn-back-add-recipient"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-white mb-8">
        {isEditing ? "Edit recipient" : "Add recipient"}
      </h1>

      <div className="flex-1 space-y-4">
        {/* Name */}
        <div>
          <label className="text-zinc-400 text-sm mb-2 block">Name</label>
          <input
            data-testid="input-recipient-name-field"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full h-14 bg-[#18181B] border border-white/10 rounded-2xl px-4 text-white text-base placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-zinc-400 text-sm mb-2 block">Email</label>
          <input
            data-testid="input-recipient-email-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full h-14 bg-[#18181B] border border-white/10 rounded-2xl px-4 text-white text-base placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
        </div>

        {/* Relationship */}
        <div>
          <label className="text-zinc-400 text-sm mb-2 block">Relationship</label>
          <Select value={relationship} onValueChange={setRelationship}>
            <SelectTrigger
              data-testid="select-relationship"
              className="h-14 bg-[#18181B] border border-white/10 text-white rounded-2xl text-base px-4 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#18181B] border border-white/10 rounded-2xl">
              {RELATIONSHIPS.map((rel) => (
                <SelectItem
                  key={rel}
                  value={rel}
                  className="text-white text-base py-3 focus:bg-white/5 focus:text-white cursor-pointer"
                >
                  {rel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Save button */}
      <div className="pt-8">
        <button
          data-testid="btn-save-recipient"
          onClick={handleSave}
          disabled={!canSave}
          className={`w-full h-14 rounded-full text-lg font-medium transition-all active:scale-[0.97] ${
            canSave
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white btn-glow"
              : "bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
          }`}
        >
          Save recipient
        </button>
      </div>
    </div>
  );
}
