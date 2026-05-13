import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, clearMessages, updateMessage, deleteMessage } from "../../store/slices/socket.slice";
import { updateIncident } from "../../store/slices/incident.slice";
import { incidentService } from "../../services/incident.service";
import { getSocket, sendMessage, toggleIncidentStatus, updateMessage as socketUpdateMessage, deleteMessage as socketDeleteMessage } from "../../utils/socket/socket";
import { ROLES, STATUS_LABELS, STATUS_COLORS, SEVERITY_LABELS, SEVERITY_COLORS } from "../../utils/constants";
import AIAssistantDialog from "./AIAssistantDialog";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Clock, MessageCircle, Send, Loader2, X, CheckCircle, Pencil, Trash2, Save, ServerCrash } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export default function IncidentDetailView({ incident, onClose, orgJoinCode }) {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const messages = useSelector((state) => state.socket.messages[incident?._id] || []);
  const [reportInput, setReportInput] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState("");
  const [deleteConfirmMsg, setDeleteConfirmMsg] = useState(null);
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    dispatch(clearMessages(incident._id));
    try {
      const msgs = await incidentService.getMessages(incident._id);
      msgs.forEach((msg) => {
        dispatch(addMessage({ incidentId: incident._id, message: msg }));
      });
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [incident._id, dispatch]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const socket = getSocket();
    const handleReceiveMessage = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.incidentId === incident._id || parsed.tempId === incident._id) {
        const existing = messages.some(
          (m) => m._id === parsed._id || (m.content === parsed.content && m.sender === parsed.sender)
        );
        if (existing) return;
        dispatch(
          addMessage({
            incidentId: incident._id,
            message: {
              _id: parsed._id || `msg-${Date.now()}`,
              content: parsed.content,
              sender: parsed.sender || "Unknown",
              senderId: parsed.senderId,
              senderRole: parsed.senderRole || "user",
              createdAt: parsed.createdAt || new Date().toISOString(),
            },
          })
        );
      }
    };
    const handleIncidentUpdated = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed._id === incident._id) {
        dispatch(updateIncident(parsed));
      }
    };
    const handleMessageUpdated = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.incidentId === incident._id) {
        dispatch(updateMessage({
          incidentId: parsed.incidentId,
          messageId: parsed._id,
          content: parsed.content,
          updatedAt: parsed.updatedAt,
        }));
        if (editingMessageId === parsed._id) {
          setEditingMessageId(null);
          setEditingMessageContent("");
        }
      }
    };
    const handleMessageDeleted = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.incidentId === incident._id) {
        dispatch(deleteMessage({ incidentId: parsed.incidentId, messageId: parsed._id }));
        if (deleteConfirmMsg?._id === parsed._id) {
          setDeleteConfirmMsg(null);
        }
      }
    };
    socket.on("receive-message", handleReceiveMessage);
    socket.on("incident-updated", handleIncidentUpdated);
    socket.on("message-updated", handleMessageUpdated);
    socket.on("message-deleted", handleMessageDeleted);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("incident-updated", handleIncidentUpdated);
      socket.off("message-updated", handleMessageUpdated);
      socket.off("message-deleted", handleMessageDeleted);
    };
  }, [incident._id, dispatch, messages, editingMessageId, deleteConfirmMsg]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReport = () => {
    if (!reportInput.trim() || !orgJoinCode) return;
    setSendingReport(true);
    dispatch(
      addMessage({
        incidentId: incident._id,
        message: {
          _id: `msg-${Date.now()}`,
          content: reportInput.trim(),
          sender: user?.username || "You",
          senderId: user?.id || user?._id,
          senderRole: role,
          createdAt: new Date().toISOString(),
        },
      })
    );
    sendMessage({
      message: reportInput.trim(),
      tempId: incident._id,
      joinCode: orgJoinCode,
      userId: user?.id || user?._id,
      senderName: user?.username,
      incidentId: incident._id,
    });
    setReportInput("");
    setSendingReport(false);
  };

  const handleToggleStatus = useCallback(() => {
    if (role !== ROLES.ORGANIZATION) return;
    toggleIncidentStatus({ incidentId: incident._id, joinCode: orgJoinCode });
  }, [incident._id, orgJoinCode, role]);

  const handleEditMessage = useCallback((msg) => {
    setEditingMessageId(msg._id);
    setEditingMessageContent(msg.content);
  }, []);

  const handleSaveMessage = useCallback(async () => {
    if (!editingMessageContent.trim()) return;
    try {
      await socketUpdateMessage({
        messageId: editingMessageId,
        content: editingMessageContent,
        incidentId: incident._id,
        joinCode: orgJoinCode,
        userId: user?.id || user?._id,
      });
      setEditingMessageId(null);
      setEditingMessageContent("");
    } catch (err) {
      console.error("Failed to update message:", err);
    }
  }, [editingMessageId, editingMessageContent, incident._id, orgJoinCode, user]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingMessageContent("");
  }, []);

  const handleDeleteMessageRequest = useCallback((msg) => {
    setDeleteConfirmMsg(msg);
  }, []);

  const handleDeleteMessageConfirm = useCallback(async () => {
    if (!deleteConfirmMsg) return;
    try {
      await socketDeleteMessage({
        messageId: deleteConfirmMsg._id,
        incidentId: incident._id,
        joinCode: orgJoinCode,
        userId: user?.id || user?._id,
      });
      setDeleteConfirmMsg(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }, [deleteConfirmMsg, incident._id, orgJoinCode, user]);

  const renderMessageContent = useCallback((msg) => {
    const isOwner = String(msg.senderId) === String(user?.id || user?._id);

    if (editingMessageId === msg._id) {
      return (
        <div className="space-y-2">
          <Textarea
            value={editingMessageContent}
            onChange={(e) => setEditingMessageContent(e.target.value)}
            className="text-sm min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSaveMessage();
              }
              if (e.key === "Escape") handleCancelEdit();
            }}
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleSaveMessage}
              className="h-7 gap-1 text-xs"
            >
              <Save className="w-3 h-3" /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <p className="text-sm text-[#49423D]">{msg.content}</p>
        {isOwner && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEditMessage(msg)}
              className="p-0.5 rounded hover:bg-[#37322F]/10 text-[#605A57] transition-colors"
              title="Edit message"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteMessageRequest(msg)}
              className="p-0.5 rounded hover:bg-red-100 text-[#605A57] hover:text-red-600 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </>
    );
  }, [editingMessageId, editingMessageContent, user, handleEditMessage, handleSaveMessage, handleCancelEdit, handleDeleteMessageRequest]);

  return (
    <Card className="border-[rgba(55,50,47,0.12)] w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className={`${STATUS_COLORS[incident.status]} border`}>
                {STATUS_LABELS[incident.status]}
              </Badge>
              {incident.severity && (
                <Badge variant="outline" className={`${SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.medium} border`}>
                  {SEVERITY_LABELS[incident.severity]}
                </Badge>
              )}
              {incident.source === 'auto-error' && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1">
                  <ServerCrash className="w-3 h-3" /> Auto-Detected
                </Badge>
              )}
              <span className="flex items-center gap-1 text-xs text-[#605A57]">
                <Clock className="w-3 h-3" />
                {new Date(incident.createdAt).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
              {incident.serverName && (
                <span className="text-xs text-[#605A57]">Server: {incident.serverName}</span>
              )}
            </div>
            <CardTitle className="text-xl font-serif mt-3">{incident.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            {role === ROLES.ORGANIZATION && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs text-[#605A57]">
                  {incident.status === "closed" ? "Reopen" : "Close"}
                </span>
                <Switch
                  checked={incident.status !== "closed"}
                  onCheckedChange={handleToggleStatus}
                />
              </div>
            )}
            <AIAssistantDialog
                incidentId={incident._id}
                onSummarize={incidentService.aiSummarize}
                onAsk={incidentService.aiAsk}
              />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#F7F5F3] text-[#605A57] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <Separator className="mx-6" />
      <CardContent className="pt-4 pb-3">
        <div className="text-sm text-[#49423D] whitespace-pre-wrap markdown-content max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[rgba(55,50,47,0.2)] scrollbar-track-transparent">
          <MarkdownRenderer content={incident.description} />
        </div>
      </CardContent>

      <Separator className="mx-6" />
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-4 h-4 text-[#605A57]" />
          <h4 className="text-sm font-medium text-[#37322F]">Reports ({messages.length})</h4>
        </div>

        {incident.status === "closed" && (
          <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-red-50 border border-red-100 rounded-lg">
            <CheckCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-600 font-medium">This incident is closed. No more reports can be submitted.</span>
          </div>
        )}

        <ScrollArea className="max-h-[350px] mb-4 pr-2">
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#37322F]" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-[#605A57]/60 py-8">No reports yet.</p>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-[#37322F]/15" />
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg._id} className="relative group">
                    <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#37322F] border-2 border-white flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="bg-[#F7F5F3] rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#37322F]">{msg.sender}</span>
                        <span className="text-xs text-[#605A57]/50">
                          {msg.updatedAt ? "edited " : ""}
                          {msg.updatedAt ? new Date(msg.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) :
                            (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")}
                        </span>
                      </div>
                      {renderMessageContent(msg)}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </ScrollArea>

        {role === ROLES.USER && incident.status !== "closed" && (
          <div className="flex gap-2">
            <Input
              value={reportInput}
              onChange={(e) => setReportInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReport()}
              placeholder="Write a report update..."
              className="flex-1"
            />
            <Button
              onClick={handleSendReport}
              disabled={!reportInput.trim() || sendingReport}
              className="bg-[#37322F] hover:bg-[#37322F]/90 shrink-0"
            >
              {sendingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Report
            </Button>
          </div>
        )}
      </div>

      {deleteConfirmMsg && (
        <Dialog open={!!deleteConfirmMsg} onOpenChange={() => setDeleteConfirmMsg(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
              <DialogDescription>Are you sure you want to delete this message? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="bg-[#F7F5F3] rounded-lg p-3 text-sm text-[#49423D]">
              {deleteConfirmMsg.content}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmMsg(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteMessageConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
