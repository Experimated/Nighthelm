import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Toaster } from "sonner";
import "./App.css";

import HomeScreen from "./components/HomeScreen";
import ScheduledMessages from "./components/ScheduledMessages";
import RecipientSelect from "./components/RecipientSelect";
import FlowAReasons from "./components/FlowAReasons";
import AILoading from "./components/AILoading";
import ExcuseCards from "./components/ExcuseCards";
import ReviewMessage from "./components/ReviewMessage";
import Confirmation from "./components/Confirmation";
import FlowBWrite from "./components/FlowBWrite";
import FlowBAnalysis from "./components/FlowBAnalysis";
import Settings from "./components/Settings";
import AddRecipient from "./components/AddRecipient";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function App() {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // ── Core state ────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState("home");
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [senderSettings, setSenderSettings] = useState({ sender_name: "", sender_email: "" });

  // ── Flow shared state ─────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState("Boss");
  const [selectedRecipient, setSelectedRecipient] = useState({ name: "", email: "" });
  const [sendTime, setSendTime] = useState("07:40");
  const [currentFlow, setCurrentFlow] = useState("a");
  const [loadingTitle, setLoadingTitle] = useState("Preparing responses");

  // ── Flow A state ──────────────────────────────────────────────────────────
  const [selectedReason, setSelectedReason] = useState("");
  const [generatedExcuses, setGeneratedExcuses] = useState([]);
  const [usedReasonsList, setUsedReasonsList] = useState([]);

  // ── Flow B state ──────────────────────────────────────────────────────────
  const [inputMessage, setInputMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  // ── Review state ──────────────────────────────────────────────────────────
  const [reviewData, setReviewData] = useState({ subject: "", body: "" });

  // ── Settings state ────────────────────────────────────────────────────────
  const [editingRecipient, setEditingRecipient] = useState(null);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/messages`);
      setScheduledMessages(data);
    } catch {}
  }, []);

  const fetchRecipients = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/recipients`);
      setRecipients(data);
    } catch {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/settings`);
      setSenderSettings(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchRecipients();
    fetchSettings();
  }, [fetchMessages, fetchRecipients, fetchSettings]);

  const navigate = useCallback((s) => setScreen(s), []);

  // ── Flow A handlers ───────────────────────────────────────────────────────
  const onFlowARecipientContinue = async () => {
    try {
      const recipientKey = selectedRecipient?.id || selectedType;
      const { data } = await axios.get(`${API}/used-reasons/${recipientKey}`);
      setUsedReasonsList(data.map((r) => r.reason_type));
    } catch {}
    navigate("flow-a-reason");
  };

  const onGenerateExcuses = async (reason) => {
    setSelectedReason(reason);
    setLoadingTitle("Preparing responses");
    navigate("ai-loading");
    try {
      const { data } = await axios.post(`${API}/ai/excuses`, {
        reason,
        recipient_type: selectedType,
      });
      setGeneratedExcuses(data.excuses);
      navigate("flow-a-excuses");
    } catch {
      navigate("flow-a-reason");
    }
  };

  const onRetryExcuses = async () => {
    setLoadingTitle("Preparing responses");
    navigate("ai-loading");
    try {
      const { data } = await axios.post(`${API}/ai/excuses`, {
        reason: selectedReason,
        recipient_type: selectedType,
      });
      setGeneratedExcuses(data.excuses);
      navigate("flow-a-excuses");
    } catch {
      navigate("flow-a-excuses");
    }
  };

  const wrapBody = (raw) => {
    const name = (selectedRecipient?.name || "").trim();
    const firstName = name ? name.split(/\s+/)[0] : null;
    const greeting = firstName ? `Hi ${firstName},\n\n` : "";
    const sig = (senderSettings?.sender_name || "").trim();
    const closing = sig ? `\n\nBest,\n${sig}` : "";
    return `${greeting}${raw}${closing}`;
  };

  const onSelectExcuse = (excuse) => {
    setReviewData({ subject: excuse.subject, body: wrapBody(excuse.body) });
    setCurrentFlow("a");
    navigate("review");
  };

  // ── Flow B handlers ───────────────────────────────────────────────────────
  const onAnalyzeMessage = async () => {
    setLoadingTitle("Checking your message");
    navigate("ai-loading");
    try {
      const { data } = await axios.post(`${API}/ai/analyze`, {
        text: inputMessage,
        recipient_type: selectedType,
      });
      setAnalysisResult(data);
      navigate("flow-b-analysis");
    } catch {
      navigate("flow-b-write");
    }
  };

  const onUseSuggestion = (version) => {
    setReviewData({ subject: version.subject, body: wrapBody(version.body) });
    setCurrentFlow("b");
    navigate("review");
  };

  // ── Schedule message ──────────────────────────────────────────────────────
  const onSendMessage = async () => {
    const clampedTime = (() => {
      const [h, m] = sendTime.split(":").map(Number);
      const total = h * 60 + m;
      if (total < 360) return "06:00";
      if (total > 780) return "13:00";
      return sendTime;
    })();
    if (clampedTime !== sendTime) setSendTime(clampedTime);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = clampedTime.split(":");
    tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    try {
      const { data } = await axios.post(`${API}/messages`, {
        recipient_email: selectedRecipient.email || "recipient@example.com",
        recipient_name: selectedRecipient.name || selectedType,
        subject: reviewData.subject,
        body: reviewData.body,
        scheduled_for: tomorrow.toISOString(),
        status: "scheduled",
        sender_mode: "simulation",
        reply_to_email: null,
      });
      setScheduledMessages((prev) => [...prev, data]);
      if (currentFlow === "a" && selectedReason) {
        const recipientKey = selectedRecipient?.id || selectedType;
        try {
          await axios.post(`${API}/used-reasons`, {
            recipient_id: recipientKey,
            reason_type: selectedReason,
          });
          setUsedReasonsList((prev) => [...new Set([...prev, selectedReason])]);
        } catch {}
      }
      navigate("confirmation");
    } catch (e) {
      console.error("Failed to schedule message", e);
    }
  };

  // ── Cancel handlers ───────────────────────────────────────────────────────
  const onCancelMessage = async (messageId) => {
    try {
      await axios.delete(`${API}/messages/${messageId}`);
      setScheduledMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {}
  };

  const onCancelAllMessages = async () => {
    try {
      await axios.delete(`${API}/messages`);
      setScheduledMessages([]);
    } catch {}
  };

  // ── Settings handlers ─────────────────────────────────────────────────────
  const onSaveRecipient = async (data) => {
    try {
      if (editingRecipient) {
        await axios.put(`${API}/recipients/${editingRecipient.id}`, data);
      } else {
        await axios.post(`${API}/recipients`, data);
      }
      await fetchRecipients();
      navigate("settings");
    } catch (e) {
      console.error("Failed to save recipient", e);
    }
  };

  const onDeleteRecipient = async (id) => {
    try {
      await axios.delete(`${API}/recipients/${id}`);
      setRecipients((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  const onSaveSenderSettings = async (data) => {
    try {
      const { data: updated } = await axios.put(`${API}/settings`, data);
      setSenderSettings(updated);
    } catch {}
  };

  const onDeleteSentMessage = async (messageId) => {
    try {
      await axios.delete(`${API}/messages/${messageId}?permanent=true`);
      setScheduledMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {}
  };

  // ── Screen renderer ───────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            scheduledMessages={scheduledMessages.filter((m) => ["scheduled", "pending"].includes(m.status))}
            onStartFlowA={() => { setCurrentFlow("a"); navigate("flow-a-recipient"); }}
            onStartFlowB={() => { setCurrentFlow("b"); navigate("flow-b-recipient"); }}
            onSettings={() => navigate("settings")}
            onCancelAll={() => navigate("scheduled")}
          />
        );

      case "scheduled":
        return (
          <ScheduledMessages
            messages={scheduledMessages}
            onCancelOne={onCancelMessage}
            onCancelAll={onCancelAllMessages}
            onDeleteSent={onDeleteSentMessage}
            onBack={() => navigate("home")}
          />
        );

      case "flow-a-recipient":
        return (
          <RecipientSelect
            title="Who is this for?"
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            recipients={recipients}
            onContinue={onFlowARecipientContinue}
            onBack={() => navigate("home")}
          />
        );

      case "flow-a-reason":
        return (
          <FlowAReasons
            selectedType={selectedType}
            usedReasons={usedReasonsList}
            onGenerate={onGenerateExcuses}
            onBack={() => navigate("flow-a-recipient")}
          />
        );

      case "ai-loading":
        return <AILoading title={loadingTitle} />;

      case "flow-a-excuses":
        return (
          <ExcuseCards
            excuses={generatedExcuses}
            onSelect={onSelectExcuse}
            onRetry={onRetryExcuses}
            onBack={() => navigate("flow-a-reason")}
          />
        );

      case "review":
        return (
          <ReviewMessage
            reviewData={reviewData}
            setReviewData={setReviewData}
            sendTime={sendTime}
            setSendTime={setSendTime}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            recipients={recipients}
            currentFlow={currentFlow}
            onSend={onSendMessage}
            onBack={() => navigate(currentFlow === "a" ? "flow-a-excuses" : "flow-b-analysis")}
            onSettings={() => navigate("settings")}
          />
        );

      case "confirmation":
        return (
          <Confirmation
            reviewData={reviewData}
            sendTime={sendTime}
            selectedRecipient={selectedRecipient}
            onDone={() => navigate("home")}
          />
        );

      case "flow-b-recipient":
        return (
          <RecipientSelect
            title="Who is this for?"
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            recipients={recipients}
            onContinue={() => navigate("flow-b-write")}
            onBack={() => navigate("home")}
          />
        );

      case "flow-b-write":
        return (
          <FlowBWrite
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onAnalyze={onAnalyzeMessage}
            onBack={() => navigate("flow-b-recipient")}
          />
        );

      case "flow-b-analysis":
        return (
          <FlowBAnalysis
            analysisResult={analysisResult}
            onUseSafer={() => onUseSuggestion(analysisResult.safer_version)}
            onUseShorter={() => onUseSuggestion(analysisResult.shorter_version)}
            onEdit={() => navigate("flow-b-write")}
            onBack={() => navigate("flow-b-write")}
          />
        );

      case "settings":
        return (
          <Settings
            recipients={recipients}
            sendTime={sendTime}
            setSendTime={setSendTime}
            senderSettings={senderSettings}
            onSaveSenderSettings={onSaveSenderSettings}
            onAddRecipient={() => { setEditingRecipient(null); navigate("settings-add"); }}
            onEditRecipient={(r) => { setEditingRecipient(r); navigate("settings-add"); }}
            onDeleteRecipient={onDeleteRecipient}
            onBack={() => navigate("home")}
          />
        );

      case "settings-add":
        return (
          <AddRecipient
            editingRecipient={editingRecipient}
            onSave={onSaveRecipient}
            onBack={() => navigate("settings")}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="App min-h-screen bg-[#0A0A0B]">
      <Toaster position="top-center" theme="dark" richColors />
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">
        <div key={screen} className="screen-enter">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
