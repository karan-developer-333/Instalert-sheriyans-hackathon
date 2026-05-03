import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIncidentsStart, fetchIncidentsSuccess, fetchIncidentsFailure,
  addIncident, updateIncident, removeIncident,
} from "../../store/slices/incident.slice";
import { clearMessages } from "../../store/slices/socket.slice";
import { incidentService } from "../../services/incident.service";
import { organizationService } from "../../services/organization.service";
import { getSocket, joinOrganization } from "../../utils/socket/socket";
import { ROLES, STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
import IncidentDetailView from "../components/IncidentDetailView";
import {
  FileText, Loader2, AlertCircle, X, ChevronRight, Building2,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

export default function IncidentsPage() {
  const dispatch = useDispatch();
  const { incidents, loading: incidentsLoading } = useSelector((state) => state.incident);
  const { role } = useSelector((state) => state.auth);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [error, setError] = useState("");
  const [orgData, setOrgData] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  const loadIncidents = useCallback(async () => {
    dispatch(fetchIncidentsStart());
    try {
      const data = await incidentService.getIncidents();
      dispatch(fetchIncidentsSuccess(data));
    } catch (err) {
      dispatch(fetchIncidentsFailure(err.message));
    }
  }, [dispatch]);

  const loadOrg = useCallback(async () => {
    setLoadingOrg(true);
    try {
      let orgResult;
      if (role === ROLES.ORGANIZATION) {
        orgResult = await organizationService.getMyOwnOrg();
      } else {
        orgResult = await organizationService.getMyOrg();
      }
      setOrgData(orgResult.organization);
    } catch (err) {
      console.error("Failed to load org:", err);
    } finally {
      setLoadingOrg(false);
    }
  }, [role]);

  useEffect(() => {
    loadIncidents();
    loadOrg();
  }, [loadIncidents, loadOrg]);

  useEffect(() => {
    const socket = getSocket();
    const handleReceiveIncident = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      dispatch(addIncident(parsed));
    };
    const handleIncidentUpdated = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      dispatch(updateIncident(parsed));
      if (selectedIncident?._id === parsed._id) {
        setSelectedIncident((prev) => ({ ...prev, status: parsed.status }));
      }
    };
    const handleIncidentDeleted = (data) => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      dispatch(removeIncident(parsed._id));
      if (selectedIncident?._id === parsed._id) setSelectedIncident(null);
    };
    socket.on("receive-incident", handleReceiveIncident);
    socket.on("incident-updated", handleIncidentUpdated);
    socket.on("incident-deleted", handleIncidentDeleted);
    return () => {
      socket.off("receive-incident", handleReceiveIncident);
      socket.off("incident-updated", handleIncidentUpdated);
      socket.off("incident-deleted", handleIncidentDeleted);
    };
  }, [dispatch, selectedIncident]);

  useEffect(() => {
    if (orgData?.organizationJoinCode) {
      joinOrganization(orgData.organizationJoinCode);
    }
  }, [orgData]);

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
  };

  const handleCloseDetail = () => {
    if (selectedIncident) {
      dispatch(clearMessages(selectedIncident._id));
    }
    setSelectedIncident(null);
  };

  if (loadingOrg) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#37322F]" />
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="p-8">
        <Card className="border-[rgba(55,50,47,0.12)]">
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-[#605A57]/30 mx-auto mb-3" />
            <p className="text-[#605A57]">You need to join an organization first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#37322F]/10 rounded-lg">
          <FileText className="w-6 h-6 text-[#37322F]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#37322F]">Incidents</h1>
          <p className="text-sm text-[#605A57]">{orgData.organizationName}</p>
        </div>
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

      {incidentsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#37322F]" />
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-[rgba(55,50,47,0.12)]">
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-[#605A57]/30 mx-auto mb-3" />
            <p className="text-[#605A57]">No incidents yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className={`space-y-2 ${selectedIncident ? "lg:col-span-2" : "lg:col-span-5"}`}>
            {incidents.map((incident) => (
              <button
                key={incident._id}
                onClick={() => handleSelectIncident(incident)}
                className={`w-full text-left bg-white border rounded-lg px-5 py-4 transition-all ${
                  selectedIncident?._id === incident._id
                    ? "border-[#37322F] shadow-sm bg-[#F7F5F3]"
                    : "border-[rgba(55,50,47,0.12)] hover:bg-[#F7F5F3]"
                } ${incident.status === "closed" ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 ${incident.status === "closed" ? "text-[#605A57]/50" : "text-[#605A57]"}`} />
                    <div>
                      <p className="text-sm font-medium text-[#37322F]">{incident.title}</p>
                      <p className="text-xs text-[#605A57]">
                        {new Date(incident.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${STATUS_COLORS[incident.status]} border`}>
                      {STATUS_LABELS[incident.status]}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-[#605A57]" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedIncident && (
            <div className="lg:col-span-3">
              <IncidentDetailView
                incident={selectedIncident}
                onClose={handleCloseDetail}
                orgJoinCode={orgData.organizationJoinCode}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
