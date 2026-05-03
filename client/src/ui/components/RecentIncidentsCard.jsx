import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowRight, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";

export default function RecentIncidentsCard() {
  const navigate = useNavigate();
  const { recentIncidents } = useSelector((state) => state.organization.incidentStats);

  if (!recentIncidents || recentIncidents.length === 0) {
    return (
      <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#37322F]" />
            <h3 className="text-lg font-semibold text-[#37322F]">Today's Incidents</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/incidents")} className="text-sm text-[#605A57]">
            View More <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-[#605A57]">
          <FileText className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No incidents reported today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#37322F]" />
          <h3 className="text-lg font-semibold text-[#37322F]">Today's Incidents</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/incidents")} className="text-sm text-[#605A57]">
          View More <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      <div className="space-y-2">
        {recentIncidents.map((inc) => (
          <button
            key={inc._id}
            onClick={() => navigate(`/dashboard/incidents/${inc._id}`)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F7F5F3] transition-colors text-left"
          >
            <div className="p-1.5 bg-[#37322F]/10 rounded-md shrink-0">
              <FileText className="w-4 h-4 text-[#37322F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#37322F] truncate">{inc.title}</p>
              <p className="text-xs text-[#605A57] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(inc.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <Badge className={`text-xs ${STATUS_COLORS[inc.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {STATUS_LABELS[inc.status] || inc.status}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
