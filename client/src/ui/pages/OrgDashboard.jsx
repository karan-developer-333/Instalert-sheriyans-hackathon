import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrgStart, fetchOrgSuccess, fetchEmployeesSuccess, fetchOrgFailure, removeEmployeeSuccess,
} from "../../store/slices/organization.slice";
import { addIncident, updateIncident, removeIncident } from "../../store/slices/incident.slice";
import { addMessage, updateMessage, deleteMessage } from "../../store/slices/socket.slice";
import { organizationService } from "../../services/organization.service";
import { incidentService } from "../../services/incident.service";
import { getSocket, joinOrganization, createIncident, toggleIncidentStatus, updateMessage as socketUpdateMessage, deleteMessage as socketDeleteMessage } from "../../utils/socket/socket";
import { STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
import EmployeeRow from "../components/EmployeeRow";
import AIAssistantDialog from "../components/AIAssistantDialog";
import OwnerDashboardHeader from "../components/OwnerDashboardHeader";
import Leaderboard from "../components/Leaderboard";
import OrgAIBubble from "../components/OrgAIBubble";
import ConfirmDialog from "../components/ConfirmDialog";
import { SkeletonTabs, SkeletonDashboardHeader } from "../components/Skeleton";
import { Users, Plus, Loader2, AlertCircle, X, ClipboardCopy,
  FileText, Clock, Trash2, CheckCircle, ChevronDown, ChevronUp, MessageCircle, Pencil, Save,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";

export default function OrgDashboard() {
  const dispatch = useDispatch();
  const { organization, employees, loading: orgLoading } = useSelector((state) => state.organization);
  const { incidents, selectedIncident: reduxSelectedIncident } = useSelector((state) => state.incident);
  const { user, role } = useSelector((state) => state.auth);
  const messages = useSelector((state) => state.socket.messages);

  const [activeTab, setActiveTab] = useState("incidents");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [closingId, setClosingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState("");
  const [deleteConfirmMsg, setDeleteConfirmMsg] = useState(null);
  const [confirmDeleteIncident, setConfirmDeleteIncident] = useState(null);
  const [confirmRemoveEmployee, setConfirmRemoveEmployee] = useState(null);

  const loadData = useCallback(async () => {
    dispatch(fetchOrgStart());
    try {
      const [orgData, empData] = await Promise.all([
        organizationService.getOrganization(),
        organizationService.getEmployees(),
      ]);
      dispatch(fetchOrgSuccess(orgData));
      dispatch(fetchEmployeesSuccess(empData));
    } catch (err) {
      dispatch(fetchOrgFailure(err.message));
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const socket = getSocket();
    if (organization?.organizationJoinCode) {
      joinOrganization(organization.organizationJoinCode);
    }
    const handleReceiveIncident = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      dispatch(addIncident(parsed));
    };
    const handleIncidentUpdated = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      dispatch(updateIncident(parsed));
      if (selectedIncident?._id === parsed._id) {
        setSelectedIncident((prev) => prev ? { ...prev, status: parsed.status } : null);
      }
    };
    const handleSocketError = (errMsg) => {
      setActionError(typeof errMsg === "string" ? errMsg : "An error occurred");
    };
    const handleReceiveMessage = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.incidentId) {
        dispatch(addMessage({ incidentId: parsed.incidentId, message: parsed }));
      }
    };
    const handleIncidentDeleted = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      dispatch(removeIncident(parsed._id));
      if (selectedIncident?._id === parsed._id) setSelectedIncident(null);
    };
    const handleMessageUpdated = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
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
    };
    const handleMessageDeleted = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      dispatch(deleteMessage({ incidentId: parsed.incidentId, messageId: parsed._id }));
      if (deleteConfirmMsg?._id === parsed._id) {
        setDeleteConfirmMsg(null);
      }
    };
    socket.on("receive-incident", handleReceiveIncident);
    socket.on("incident-updated", handleIncidentUpdated);
    socket.on("error", handleSocketError);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("incident-deleted", handleIncidentDeleted);
    socket.on("message-updated", handleMessageUpdated);
    socket.on("message-deleted", handleMessageDeleted);
    return () => {
      socket.off("receive-incident", handleReceiveIncident);
      socket.off("incident-updated", handleIncidentUpdated);
      socket.off("error", handleSocketError);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("incident-deleted", handleIncidentDeleted);
      socket.off("message-updated", handleMessageUpdated);
      socket.off("message-deleted", handleMessageDeleted);
    };
  }, [organization, dispatch, selectedIncident, editingMessageId, deleteConfirmMsg]);

  useEffect(() => {
    if (reduxSelectedIncident && selectedIncident?._id !== reduxSelectedIncident._id) {
      setSelectedIncident(reduxSelectedIncident);
    }
  }, [reduxSelectedIncident]);

  const loadMessages = useCallback(async (incidentId) => {
    setLoadingMessages(true);
    try {
      const msgs = await incidentService.getMessages(incidentId);
      msgs.forEach((msg) => {
        dispatch(addMessage({ incidentId, message: msg }));
      });
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [dispatch]);

  const handleSelectIncident = useCallback((incident) => {
    if (selectedIncident?._id === incident._id) {
      setSelectedIncident(null);
    } else {
      setSelectedIncident(incident);
      loadMessages(incident._id);
    }
  }, [selectedIncident, loadMessages]);

  const handleCreateIncident = useCallback(async () => {
    if (!newIncident.title || !newIncident.description) return;
    setCreating(true);
    setActionError("");
    try {
      createIncident({
        title: newIncident.title,
        description: newIncident.description,
        organizationId: organization?._id,
        joinCode: organization?.organizationJoinCode,
      });
      setNewIncident({ title: "", description: "" });
      setShowCreateForm(false);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCreating(false);
    }
  }, [newIncident, organization]);

  const handleDeleteIncident = useCallback(async (id) => {
    try {
      await incidentService.deleteIncident(id);
      dispatch(removeIncident(id));
      if (selectedIncident?._id === id) setSelectedIncident(null);
      setConfirmDeleteIncident(null);
    } catch (err) {
      setActionError(err.message);
      setConfirmDeleteIncident(null);
    }
  }, [dispatch, selectedIncident]);

  const handleToggleIncidentStatus = useCallback(async (incident) => {
    try {
      toggleIncidentStatus({ incidentId: incident._id, joinCode: organization?.organizationJoinCode });
      const newStatus = incident.status === "closed" ? "open" : "closed";
      if (selectedIncident?._id === incident._id) {
        setSelectedIncident((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      setActionError(err.message);
    }
  }, [organization, selectedIncident]);

  const handleEditMessage = useCallback((msg) => {
    setEditingMessageId(msg._id);
    setEditingMessageContent(msg.content);
  }, []);

  const handleSaveMessage = useCallback(async (incidentId) => {
    if (!editingMessageContent.trim()) return;
    try {
      await socketUpdateMessage({
        messageId: editingMessageId,
        content: editingMessageContent,
        incidentId,
        joinCode: organization?.organizationJoinCode,
        userId: user?.id || user?._id,
      });
      setEditingMessageId(null);
      setEditingMessageContent("");
    } catch (err) {
      setActionError(err.message || "Failed to update message");
    }
  }, [editingMessageId, editingMessageContent, organization, user]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingMessageContent("");
  }, []);

  const handleDeleteMessageRequest = useCallback((msg) => {
    setDeleteConfirmMsg(msg);
  }, []);

  const handleDeleteMessageConfirm = useCallback(async (incidentId) => {
    if (!deleteConfirmMsg) return;
    try {
      await socketDeleteMessage({
        messageId: deleteConfirmMsg._id,
        incidentId,
        joinCode: organization?.organizationJoinCode,
        userId: user?.id || user?._id,
      });
      setDeleteConfirmMsg(null);
    } catch (err) {
      setActionError(err.message || "Failed to delete message");
    }
  }, [deleteConfirmMsg, organization, user]);

  const handleRemoveEmployeeConfirm = useCallback(async (userId) => {
    setRemoving(userId);
    try {
      await organizationService.removeEmployee(userId);
      dispatch(removeEmployeeSuccess(userId));
      setConfirmRemoveEmployee(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setRemoving(null);
    }
  }, [dispatch]);

  const copyJoinCode = useCallback(() => {
    if (organization?.organizationJoinCode) {
      navigator.clipboard.writeText(organization.organizationJoinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [organization]);

  const getIncidentMessages = useCallback((incidentId) => {
    return messages[incidentId] || [];
  }, [messages]);

  const renderMessageContent = useCallback((msg, incidentId) => {
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
                handleSaveMessage(incidentId);
              }
              if (e.key === "Escape") handleCancelEdit();
            }}
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => handleSaveMessage(incidentId)}
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

  const renderIncidentDetail = useCallback((incident) => {
    const incMessages = getIncidentMessages(incident._id);
    return (
      <Card className="border-[rgba(55,50,47,0.12)] mt-3">
        <div className="px-5 pt-4 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`${STATUS_COLORS[incident.status]} border shrink-0`}>
                  {STATUS_LABELS[incident.status]}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-[#605A57] shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(incident.createdAt).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#37322F] mt-2 break-words">{incident.title}</h3>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto sm:ml-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-[rgba(55,50,47,0.08)]">
              <div className="flex items-center gap-2 sm:mr-2">
                <span className="text-xs text-[#605A57]">
                  {incident.status === "closed" ? "Reopen" : "Close"}
                </span>
                <Switch
                  checked={incident.status !== "closed"}
                  onCheckedChange={() => handleToggleIncidentStatus(incident)}
                />
              </div>
              <button onClick={() => setSelectedIncident(null)} className="p-1.5 rounded-lg hover:bg-[#F7F5F3] text-[#605A57]">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <Separator className="mx-5" />
        <div className="px-5 pt-3 pb-2">
          <p className="text-sm text-[#49423D] whitespace-pre-wrap">{incident.description}</p>
        </div>
        <Separator className="mx-5" />
        <div className="px-5 pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#605A57]" />
              <h4 className="text-sm font-medium text-[#37322F]">Reports ({incMessages.length})</h4>
            </div>
            <div className="w-full sm:w-auto">
              <AIAssistantDialog
                incidentId={incident._id}
                onSummarize={incidentService.aiSummarize}
                onAsk={incidentService.aiAsk}
              />
            </div>
          </div>

          {incident.status === "closed" && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 border border-red-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600 font-medium">This incident is closed. No more reports can be submitted.</span>
            </div>
          )}

          <ScrollArea className="max-h-[250px] mb-4 pr-1">
            {loadingMessages ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-[#37322F]" />
              </div>
            ) : incMessages.length === 0 ? (
              <p className="text-center text-xs text-[#605A57]/60 py-6">No reports yet.</p>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-[#37322F]/15" />
                <div className="space-y-3">
                  {incMessages.map((msg) => (
                    <div key={msg._id} className="relative group">
                      <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#37322F] border-2 border-white flex items-center justify-center z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div className="bg-[#F7F5F3] rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-[#37322F]">{msg.sender}</span>
                          <span className="text-xs text-[#605A57]/50">
                            {msg.updatedAt ? `edited ` : ""}
                            {msg.updatedAt ? new Date(msg.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) :
                              (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")}
                          </span>
                        </div>
                        {renderMessageContent(msg, incident._id)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2">
            {incident.status === "open" && (
              <Button
                onClick={() => setConfirmDeleteIncident(incident._id)}
                variant="outline"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }, [getIncidentMessages, loadingMessages, handleToggleIncidentStatus, handleDeleteIncident, renderMessageContent]);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#37322F]/10 rounded-lg shrink-0">
            <Users className="w-6 h-6 text-[#37322F]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#37322F] break-words">
              {organization?.organizationName || "Organization"}
            </h1>
            <p className="text-xs sm:text-sm text-[#605A57]">Manage incidents and team members</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4" /> Create Incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Incident</DialogTitle>
                <DialogDescription>Describe the incident you want to report</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incident-title">Title</Label>
                  <Input
                    id="incident-title"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder="Incident title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident-desc">Description</Label>
                  <Textarea
                    id="incident-desc"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Describe the incident..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                <Button
                  onClick={handleCreateIncident}
                  disabled={creating || !newIncident.title || !newIncident.description}
                  className="bg-[#37322F] hover:bg-[#37322F]/90"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {organization?.organizationJoinCode && (
            <Button 
              variant="outline" 
              onClick={copyJoinCode}
              className="flex items-center gap-2 border-[rgba(55,50,47,0.12)] shrink-0 bg-white hover:bg-gray-50"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <ClipboardCopy className="w-4 h-4 text-[#605A57]" />}
              <span className={copied ? "text-green-600 font-medium" : "text-[#605A57]"}>
                {copied ? "Copied!" : `Join Code: ${organization.organizationJoinCode}`}
              </span>
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{actionError}</p>
          <button onClick={() => setActionError("")} className="ml-auto">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

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
              <Button
                variant="destructive"
                onClick={() => handleDeleteMessageConfirm(selectedIncident?._id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!confirmDeleteIncident}
        onOpenChange={() => setConfirmDeleteIncident(null)}
        title="Delete Incident"
        description="Delete this incident? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => handleDeleteIncident(confirmDeleteIncident)}
      />

      <ConfirmDialog
        open={!!confirmRemoveEmployee}
        onOpenChange={() => setConfirmRemoveEmployee(null)}
        title="Remove Employee"
        description="Remove this employee from the organization?"
        confirmLabel="Remove"
        onConfirm={() => handleRemoveEmployeeConfirm(confirmRemoveEmployee)}
      />

      <OwnerDashboardHeader />

      <div className="mt-6">
        <Leaderboard />
      </div>

      <div className="mt-6">
        <Separator className="my-8" />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedIncident(null); }} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="incidents">
            <FileText className="w-4 h-4" /> Incidents ({incidents.length})
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="w-4 h-4" /> Employees ({employees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          <div className="space-y-3">
            {incidents.length === 0 ? (
              <Card className="border-[rgba(55,50,47,0.12)]">
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-[#605A57]/30 mx-auto mb-3" />
                  <p className="text-[#605A57]">No incidents yet. Create one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              incidents.map((incident) => (
                <div key={incident._id}>
                  <button
                    onClick={() => handleSelectIncident(incident)}
                    className={`w-full text-left bg-white border rounded-lg px-5 py-4 transition-all ${
                      selectedIncident?._id === incident._id
                        ? "border-[#37322F] shadow-sm bg-[#F7F5F3]"
                        : "border-[rgba(55,50,47,0.12)] hover:bg-[#F7F5F3]"
                    } ${incident.status === "closed" ? "opacity-70" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#605A57] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#37322F] truncate max-w-[200px] sm:max-w-xs">{incident.title}</p>
                          <p className="text-xs text-[#605A57]">
                            {new Date(incident.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Badge variant="outline" className={`${STATUS_COLORS[incident.status]} border shrink-0`}>
                          {STATUS_LABELS[incident.status]}
                        </Badge>
                        {selectedIncident?._id === incident._id ? (
                          <ChevronUp className="w-4 h-4 text-[#605A57] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#605A57] shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                  {selectedIncident?._id === incident._id && renderIncidentDetail(incident)}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <div className="space-y-2">
            {orgLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-[rgba(55,50,47,0.12)] rounded-lg">
                    <div className="flex items-center gap-3 px-6 py-4">
                      <div className="w-9 h-9 rounded-full bg-[#37322F]/10 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-32 bg-[#37322F]/10 animate-pulse rounded" />
                        <div className="h-3 w-48 bg-[#37322F]/10 animate-pulse rounded" />
                      </div>
                      <div className="w-16 h-6 bg-[#37322F]/10 animate-pulse rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : employees.length === 0 ? (
              <Card className="border-[rgba(55,50,47,0.12)]">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-[#605A57]/30 mx-auto mb-3" />
                  <p className="text-[#605A57]">No employees yet. Share the join code to add team members.</p>
                </CardContent>
              </Card>
            ) : (
              employees.map((emp) => (
                <EmployeeRow
                  key={emp._id}
                  employee={emp}
                  isOwner={true}
                   onRemove={removing === emp._id ? null : (id) => setConfirmRemoveEmployee(id)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {role === "organization" && <OrgAIBubble />}
    </div>
  );
}
