import { useState, useCallback } from "react";
import { Sparkles, Loader2, X, Send, Building2, CheckCircle, UserMinus, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { organizationService } from "../../services/organization.service";

export default function OrgAIBubble() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = useCallback(async () => {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setMessage("");
    setError("");

    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "ai", loading: true },
    ]);
    setLoading(true);

    try {
      const result = await organizationService.askOrgAI(userMsg);
      setChatHistory((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1
            ? {
                role: "ai",
                content: result.response,
                proposals: result.proposals || (result.suggestedAction ? [result.suggestedAction] : []),
              }
            : msg
        )
      );
    } catch (err) {
      console.error("AI Error:", err);
      setChatHistory((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1
            ? {
                role: "ai",
                content:
                  err.response?.data?.error ||
                  "Failed to get response. Please check if the backend is running and CORS is configured correctly.",
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleApproveAction = useCallback(async (msgIndex, proposal) => {
    setChatHistory((prev) =>
      prev.map((msg, i) =>
        i === msgIndex
          ? {
              ...msg,
              actionStates: {
                ...(msg.actionStates || {}),
                [proposal.proposalId]: "executing",
              },
            }
          : msg
      )
    );

    try {
      const result = await organizationService.executeOrgAIAction(
        proposal.actionType,
        proposal.params || {
          title: proposal.title,
          description: proposal.description,
          severity: proposal.severity,
          userId: proposal.userId,
          username: proposal.username,
          reason: proposal.reason,
        }
      );

      setChatHistory((prev) =>
        prev.map((msg, i) =>
          i === msgIndex
            ? {
                ...msg,
                actionStates: {
                  ...(msg.actionStates || {}),
                  [proposal.proposalId]: "approved",
                },
                actionResults: {
                  ...(msg.actionResults || {}),
                  [proposal.proposalId]: result.message,
                },
              }
            : msg
        )
      );
    } catch (err) {
      setChatHistory((prev) =>
        prev.map((msg, i) =>
          i === msgIndex
            ? {
                ...msg,
                actionStates: {
                  ...(msg.actionStates || {}),
                  [proposal.proposalId]: "failed",
                },
                actionResults: {
                  ...(msg.actionResults || {}),
                  [proposal.proposalId]: err.response?.data?.error || "Failed to execute action",
                },
              }
            : msg
        )
      );
    }
  }, []);

  const handleRejectAction = useCallback((msgIndex, proposal) => {
    setChatHistory((prev) =>
      prev.map((msg, i) =>
        i === msgIndex
          ? {
              ...msg,
              actionStates: {
                ...(msg.actionStates || {}),
                [proposal.proposalId]: "rejected",
              },
            }
          : msg
      )
    );
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }, [handleAsk]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#37322F] text-white rounded-full shadow-lg hover:bg-[#37322F]/90 transition-all hover:scale-105 flex items-center justify-center z-50"
        title="Org Management AI"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white border border-[rgba(55,50,47,0.12)] rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }}>
      <div className="flex items-center gap-2 p-4 border-b border-[rgba(55,50,47,0.08)]">
        <div className="p-1.5 bg-[#37322F]/10 rounded-lg">
          <Building2 className="w-5 h-5 text-[#37322F]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#37322F]">Org Management AI</h3>
          <p className="text-xs text-[#605A57]">Ask about your organization</p>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-[#F7F5F3] text-[#605A57]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 && (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-[#37322F]/5 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-[#37322F]" />
            </div>
            <p className="text-sm text-[#37322F] font-medium mb-1">How can I help?</p>
            <p className="text-xs text-[#605A57]">Ask about team members, suggest incidents, or manage your org</p>
          </div>
        )}

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
            <div key={i} className="space-y-3">
              <div className="flex justify-start">
                <div className={`max-w-[90%] rounded-2xl rounded-bl-sm px-4 py-2.5 ${msg.isError ? "bg-red-50 border border-red-100" : "bg-[#F7F5F3]"}`}>
                  {msg.isError ? (
                    <p className="text-sm text-red-600">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>

              {msg.proposals?.map((proposal) => (
                <InlineActionCard
                  key={proposal.proposalId}
                  proposal={proposal}
                  state={msg.actionStates?.[proposal.proposalId] || "pending"}
                  result={msg.actionResults?.[proposal.proposalId]}
                  onApprove={() => handleApproveAction(i, proposal)}
                  onReject={() => handleRejectAction(i, proposal)}
                />
              ))}
            </div>
          );
        })}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <X className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <Separator />
      <div className="p-3">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your org..."
            className="flex-1 h-9 text-sm"
          />
          <Button
            onClick={handleAsk}
            disabled={!message.trim() || loading}
            size="icon"
            className="h-9 w-9 bg-[#37322F] hover:bg-[#37322F]/90 shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InlineActionCard({ proposal, state, result, onApprove, onReject }) {
  const getIcon = () => {
    switch (proposal?.actionType) {
      case "create_incident":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "remove_user":
        return <UserMinus className="w-4 h-4 text-red-500" />;
      default:
        return <Building2 className="w-4 h-4 text-[#37322F]" />;
    }
  };

  const getTitle = () => {
    switch (proposal?.actionType) {
      case "create_incident":
        return "Create Incident";
      case "remove_user":
        return `Remove User: ${proposal.username || proposal.params?.username || "Unknown"}`;
      default:
        return "Execute Action";
    }
  };

  const getDescription = () => {
    if (proposal.actionType === "create_incident") {
      return proposal.description || proposal.params?.description;
    }
    if (proposal.actionType === "remove_user") {
      return proposal.reason || proposal.params?.reason;
    }
    return null;
  };

  if (state === "approved") {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-medium text-green-700">{getTitle()} - Approved</p>
          {result && <p className="text-xs text-green-600 mt-0.5">{result}</p>}
        </div>
      </div>
    );
  }

  if (state === "rejected") {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <X className="w-4 h-4 text-gray-500 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600">{getTitle()} - Dismissed</p>
        </div>
      </div>
    );
  }

  if (state === "executing") {
    return (
      <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-sm">{getTitle()}</CardTitle>
          </div>
          {proposal.title && <CardDescription className="text-xs">{proposal.title}</CardDescription>}
        </CardHeader>
        <Separator />
        <CardContent className="pt-3 pb-3 px-3">
          <div className="flex items-center gap-2 justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#37322F]" />
            <span className="text-xs text-[#605A57]">Executing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "failed") {
    return (
      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-medium text-red-700">{getTitle()} - Failed</p>
          {result && <p className="text-xs text-red-600 mt-0.5">{result}</p>}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle className="text-sm">{getTitle()}</CardTitle>
        </div>
        {proposal.title && <CardDescription className="text-xs">{proposal.title}</CardDescription>}
      </CardHeader>
      <Separator />
      <CardContent className="pt-3 pb-3 px-3">
        {getDescription() && (
          <div className="bg-[#F7F5F3] rounded p-2 mb-3">
            <p className="text-xs text-[#49423D]">{getDescription()}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={onApprove} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approve
          </Button>
          <Button variant="outline" onClick={onReject} size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
