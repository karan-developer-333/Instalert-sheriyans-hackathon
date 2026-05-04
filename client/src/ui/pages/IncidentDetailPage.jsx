import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { setSelectedIncident } from "../../store/slices/incident.slice";
import { incidentService } from "../../services/incident.service";
import ChatBox from "../components/ChatBox";
import { getSocket, joinOrganization } from "../../utils/socket/socket";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";

export default function IncidentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadIncident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    joinOrganization(incident?.organization?.organizationJoinCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incident?.organization?._id]);

  const loadIncident = async () => {
    setLoading(true);
    try {
      const data = await incidentService.getIncident(id);
      setIncident(data);
      setSelectedIncident(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#37322F]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-[#605A57]">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-[rgba(55,50,47,0.12)]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`${STATUS_COLORS[incident.status]} border`}>
                  {STATUS_LABELS[incident.status]}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-serif mt-2">{incident.title}</CardTitle>
              <p className="text-sm text-[#605A57]">
                {new Date(incident.createdAt).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </CardHeader>
            <Separator className="mx-6" />
            <CardContent className="pt-6">
              <div className="text-[#49423D] whitespace-pre-wrap markdown-content max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[rgba(55,50,47,0.2)] scrollbar-track-transparent">
                <MarkdownRenderer content={incident.description} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ChatBox
            incidentId={incident._id}
            joinCode={organization?.organizationJoinCode || ""}
          />
        </div>
      </div>
    </div>
  );
}
