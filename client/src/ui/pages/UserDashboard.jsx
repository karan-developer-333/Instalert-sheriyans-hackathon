import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchIncidentsStart, fetchIncidentsSuccess, fetchIncidentsFailure,
  addIncident, setSelectedIncident,
} from "../../store/slices/incident.slice";
import { organizationService } from "../../services/organization.service";
import { incidentService } from "../../services/incident.service";
import { userService } from "../../services/user.service";
import { joinOrganization, getSocket } from "../../utils/socket/socket";
import IncidentCard from "../components/IncidentCard";
import EmployeeRow from "../components/EmployeeRow";
import ChatBox from "../components/ChatBox";
import JoinCodeInput from "../components/JoinCodeInput";
import { FileText, Loader2, AlertCircle, X, MessageSquare, Users, Copy, Check } from "lucide-react";
import { SkeletonIncidentRow } from "../components/Skeleton";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { incidents, selectedIncident } = useSelector((state) => state.incident);
  const { organization } = useSelector((state) => state.organization);
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (organization?.organizationJoinCode) {
      navigator.clipboard.writeText(organization.organizationJoinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (organization?.organizationJoinCode) {
      joinOrganization(organization.organizationJoinCode);
    }
    const handleReceiveIncident = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      dispatch(addIncident(parsed));
    };
    socket.on("receive-incident", handleReceiveIncident);
    return () => {
      socket.off("receive-incident", handleReceiveIncident);
    };
  }, [organization, dispatch]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [orgData, incData, empData] = await Promise.all([
        organizationService.getMyOrg(),
        incidentService.getIncidents(),
        organizationService.getEmployees(),
      ]);
      dispatch(fetchIncidentsSuccess(incData));
      setEmployees(empData.members || []);
    } catch (err) {
      if (err.status !== 404) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (joinCode) => {
    setError("");
    try {
      await userService.joinOrganization(joinCode);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenChat = (incident) => {
    dispatch(setSelectedIncident(incident));
    setShowChat(true);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#37322F]/10 rounded-lg shrink-0">
            <FileText className="w-6 h-6 text-[#37322F]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#37322F] break-words">Dashboard</h1>
            <p className="text-xs sm:text-sm text-[#605A57]">
              {organization ? `Team: ${organization.organizationName}` : "Join an organization to get started"}
            </p>
          </div>
        </div>

        {organization?.organizationJoinCode && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="flex items-center gap-2 border-[rgba(55,50,47,0.12)] shrink-0 w-fit bg-white hover:bg-gray-50"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#605A57]" />}
            <span className={copied ? "text-green-600 font-medium" : "text-[#605A57]"}>
              {copied ? "Copied!" : `Join Code: ${organization.organizationJoinCode}`}
            </span>
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {!organization && (
        <Card className="border-[rgba(55,50,47,0.12)] mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Join an Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <JoinCodeInput onJoin={handleJoin} />
          </CardContent>
        </Card>
      )}

      {organization && (
        <Tabs defaultValue="incidents" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="incidents">
              <FileText className="w-4 h-4" /> Incidents ({incidents.length})
            </TabsTrigger>
            <TabsTrigger value="employees">
              <Users className="w-4 h-4" /> Employees ({employees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <SkeletonIncidentRow key={i} />
                    ))}
                  </div>
                ) : incidents.length === 0 ? (
                  <Card className="border-[rgba(55,50,47,0.12)]">
                    <CardContent className="text-center py-12">
                      <FileText className="w-12 h-12 text-[#605A57]/30 mx-auto mb-3" />
                      <p className="text-[#605A57]">No incidents yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  incidents.map((inc) => (
                    <IncidentCard
                      key={inc._id}
                      incident={inc}
                      onChat={handleOpenChat}
                    />
                  ))
                )}
              </div>

              {showChat && selectedIncident && (
                <div className="lg:col-span-1">
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowChat(false);
                        dispatch(setSelectedIncident(null));
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-white border border-[rgba(55,50,47,0.12)] rounded-full shadow-sm hover:bg-[#F7F5F3] z-10"
                    >
                      <X className="w-4 h-4 text-[#605A57]" />
                    </button>
                    <ChatBox
                      incidentId={selectedIncident._id}
                      joinCode={organization?.organizationJoinCode || ""}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-[rgba(55,50,47,0.12)] rounded-lg px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#37322F]/10 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-32 bg-[#37322F]/10 animate-pulse rounded" />
                        <div className="h-3 w-48 bg-[#37322F]/10 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : employees.length === 0 ? (
                <Card className="border-[rgba(55,50,47,0.12)]">
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 text-[#605A57]/30 mx-auto mb-3" />
                    <p className="text-[#605A57]">No employees yet.</p>
                  </CardContent>
                </Card>
              ) : (
                employees.map((emp) => (
                  <EmployeeRow
                    key={emp._id}
                    employee={emp}
                    isOwner={false}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
