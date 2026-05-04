import { STATUS_LABELS, STATUS_COLORS, SEVERITY_LABELS, SEVERITY_COLORS } from "../../utils/constants";
import { MessageSquare, Trash2, Edit2, CheckCircle, ServerCrash } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { MarkdownRenderer } from "./MarkdownRenderer";

export default function IncidentCard({ incident, onChat, onDelete, onEdit }) {
  return (
    <Card className="border-[rgba(55,50,47,0.12)] hover:shadow-md transition-shadow">
      <CardContent className="p-5 ">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-base font-semibold text-[#37322F] truncate max-w-full">{incident.title}</h3>
              <Badge variant="outline" className={`${STATUS_COLORS[incident.status] || STATUS_COLORS.open} shrink-0`}>
                {STATUS_LABELS[incident.status] || incident.status}
              </Badge>
              {incident.severity && (
                <Badge variant="outline" className={`${SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.medium} shrink-0`}>
                  {SEVERITY_LABELS[incident.severity] || incident.severity}
                </Badge>
              )}
              {incident.source === 'auto-error' && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1 shrink-0">
                  <ServerCrash className="w-3 h-3" /> Auto
                </Badge>
              )}
            </div>
            <div className="text-sm text-[#605A57] line-clamp-2 markdown-preview mb-3 sm:mb-0">
              <MarkdownRenderer content={incident.description} />
            </div>
            <p className="text-xs text-[#605A57]/60 mt-2">
              {new Date(incident.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
              {incident.serverName && ` • ${incident.serverName}`}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-1 shrink-0 justify-end w-full sm:w-auto border-t border-[rgba(55,50,47,0.08)] sm:border-t-0 pt-3 sm:pt-0">
            {onChat && (
              <Button variant="ghost" size="icon" onClick={() => onChat(incident)} className="text-[#605A57] hover:text-[#37322F] hover:bg-[#F7F5F3]" title="Open Chat">
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(incident)} className="text-[#605A57] hover:text-amber-600 hover:bg-amber-50" title="Edit">
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(incident._id)} className="text-[#605A57] hover:text-red-600 hover:bg-red-50" title="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            {incident.status === "open" && onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(incident, "in_progress")} className="text-[#605A57] hover:text-green-600 hover:bg-green-50" title="Mark In Progress">
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
