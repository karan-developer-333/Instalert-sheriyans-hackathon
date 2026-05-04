import { useState, useCallback } from "react";
import { Sparkles, Loader2, X, Send, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { MarkdownRenderer } from "./MarkdownRenderer";

const IDLE = "idle";
const LOADING = "loading";
const RESULT = "result";
const ERROR = "error";

export default function AIAssistantDialog({ incidentId, onSummarize, onAsk }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(IDLE);
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const resetState = useCallback(() => {
    setPhase(IDLE);
    setQuestion("");
    setSummary("");
    setChatHistory([]);
    setErrorMessage("");
  }, []);

  const handleOpenChange = useCallback((isOpen) => {
    setOpen(isOpen);
    if (!isOpen) resetState();
  }, [resetState]);

  const handleSummarize = useCallback(async () => {
    setPhase(LOADING);
    setErrorMessage("");
    try {
      const result = await onSummarize(incidentId);
      setSummary(result);
      setPhase(RESULT);
    } catch {
      setErrorMessage("Failed to generate summary. Please try again.");
      setPhase(ERROR);
    }
  }, [incidentId, onSummarize]);

  const handleAsk = useCallback(async () => {
    if (!question.trim()) return;
    const userQ = question.trim();
    setQuestion("");
    if (phase === IDLE) {
      setPhase(LOADING);
    }
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: userQ },
      { role: "ai", loading: true },
    ]);
    try {
      const result = await onAsk(incidentId, userQ);
      setChatHistory((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { role: "ai", content: result } : msg
        )
      );
    } catch {
      setChatHistory((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { role: "ai", content: "Failed to get answer. Please try again.", isError: true } : msg
        )
      );
    }
  }, [incidentId, onAsk, question, phase]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }, [handleAsk]);

  const renderIdle = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-12 h-12 rounded-full bg-[#37322F]/5 flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-[#37322F]" />
      </div>
      <h3 className="text-sm font-medium text-[#37322F] mb-1 hidden md:block">AI Incident Assistant</h3>
      <p className="text-xs text-[#605A57] text-center mb-5 max-w-xs">
        Get instant AI-powered insights, summaries, and answers about this incident
      </p>
      <Button onClick={handleSummarize} disabled={phase === LOADING} className="bg-[#37322F] hover:bg-[#37322F]/90 w-full">
        {phase === LOADING ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {phase === LOADING ? "Analyzing..." : "Summarize Incident"}
      </Button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-[#37322F] mb-3" />
      <p className="text-sm text-[#605A57]">Processing your request...</p>
    </div>
  );

  const renderSummary = () => (
    <div className="px-4 py-4">
      <div className="bg-[#F7F5F3] border border-[rgba(55,50,47,0.08)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#37322F]" />
          <span className="text-xs font-semibold text-[#37322F] uppercase tracking-wide">AI Summary</span>
        </div>
        <MarkdownRenderer content={summary} />
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="px-4 py-4 space-y-4">
      {chatHistory.map((msg, i) => {
        if (msg.role === "user") {
          return (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] bg-[#37322F] text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        }
        if (msg.loading) {
          return (
            <div key={i} className="flex justify-start">
              <div className="bg-[#F7F5F3] rounded-2xl rounded-bl-sm px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-[#37322F]" />
                  <span className="text-xs text-[#605A57]">Thinking...</span>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div key={i} className="flex justify-start">
            <div className={`max-w-[90%] rounded-2xl rounded-bl-sm px-4 py-2.5 ${msg.isError ? "bg-red-50 border border-red-100" : "bg-[#F7F5F3]"}`}>
              {msg.isError ? (
                <p className="text-sm text-red-600">{msg.content}</p>
              ) : (
                <MarkdownRenderer content={msg.content} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <X className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm text-red-600 text-center mb-4">{errorMessage}</p>
      <Button onClick={handleSummarize} variant="outline" className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );

  const renderContent = () => {
    if (phase === LOADING) return renderLoading();
    if (phase === ERROR) return renderError();
    if (phase === IDLE) return renderIdle();
    return (
      <>
        {summary && renderSummary()}
        {chatHistory.length > 0 && renderChat()}
      </>
    );
  };

  const showInput = phase !== IDLE && phase !== LOADING && phase !== ERROR;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-[#37322F]/20 text-[#37322F] hover:bg-[#F7F5F3]">
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-[calc(100%-2rem)] p-0 overflow-hidden flex flex-col" style={{ maxHeight: "75vh" }}>
        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-serif font-semibold">
              <Sparkles className="w-5 h-5 text-[#37322F]" />
              AI Assistant
            </DialogTitle>
          </div>
        </DialogHeader>
        <Separator />

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>

        {showInput && (
          <>
            <Separator />
            <div className="px-5 py-3 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this incident..."
                  className="flex-1 h-10"
                />
                <Button
                  onClick={handleAsk}
                  disabled={!question.trim()}
                  size="icon"
                  className="h-10 w-10 bg-[#37322F] hover:bg-[#37322F]/90 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
