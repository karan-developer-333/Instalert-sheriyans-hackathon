import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIncidentsStart, fetchIncidentsSuccess, fetchIncidentsFailure,
  addIncident, updateIncident, removeIncident, setPage, setLimit,
} from "../../store/slices/incident.slice";
import { clearMessages } from "../../store/slices/socket.slice";
import { incidentService } from "../../services/incident.service";
import { organizationService } from "../../services/organization.service";
import { getSocket, joinOrganization } from "../../utils/socket/socket";
import { ROLES, STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
import IncidentDetailView from "../components/IncidentDetailView";
import Pagination from "../components/Pagination";
import { SkeletonIncidentRow, SkeletonDashboardHeader } from "../components/Skeleton";
import {
  FileText, Loader2, AlertCircle, X, ChevronRight, Building2,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

export default function IncidentsPage() {
  const dispatch = useDispatch();
  const { incidents, loading: incidentsLoading, pagination } = useSelector((state) => state.incident);
  const { role } = useSelector((state) => state.auth);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [error, setError] = useState("");
  const [orgData, setOrgData] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  const loadIncidents = useCallback(async () => {
    dispatch(fetchIncidentsStart());
    try {
      const data = await incidentService.getIncidents({
        page: pagination.currentPage,
        limit: pagination.limit,
      });
      dispatch(fetchIncidentsSuccess(data));
    } catch (err) {
      dispatch(fetchIncidentsFailure(err.message));
    }
  }, [dispatch, pagination.currentPage, pagination.limit]);

  const loadOrg = useCallback(async () => {
    setLoadingOrg(true);
    try {
      let orgResult;
      if (role === ROLES.ORGANIZATION) {
        orgResult = await organizationService.getOrganization();
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

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setLimit(newLimit));
  };

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <SkeletonDashboardHeader />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <SkeletonIncidentRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="p-4 sm:p-8">
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-[#37322F]/10 rounded-lg shrink-0">
          <FileText className="w-6 h-6 text-[#37322F]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#37322F] truncate">Incidents</h1>
          <p className="text-sm text-[#605A57] truncate">{orgData.organizationName}</p>
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
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
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
        <>
          <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${selectedIncident ? "lg:grid-cols-5" : ""}`}>
            <div className={`space-y-2 ${selectedIncident ? "lg:col-span-2" : ""}`}>
              {incidents.map((incident) => (
                <button
                  key={incident._id}
                  onClick={() => handleSelectIncident(incident)}
                  className={`w-full text-left bg-white border rounded-lg px-4 sm:px-5 py-3 sm:py-4 transition-all ${
                    selectedIncident?._id === incident._id
                      ? "border-[#37322F] shadow-sm bg-[#F7F5F3]"
                      : "border-[rgba(55,50,47,0.12)] hover:bg-[#F7F5F3]"
                  } ${incident.status === "closed" ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className={`w-5 h-5 shrink-0 ${incident.status === "closed" ? "text-[#605A57]/50" : "text-[#605A57]"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#37322F] truncate">{incident.title}</p>
                        <p className="text-xs text-[#605A57]">
                          {new Date(incident.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}
    </div>
  );
}
