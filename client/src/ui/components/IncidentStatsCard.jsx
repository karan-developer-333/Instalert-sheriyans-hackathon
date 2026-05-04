import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIncidentStats } from "../../store/slices/organization.slice";
import { organizationService } from "../../services/organization.service";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";

export default function IncidentStatsCard() {
  const dispatch = useDispatch();
  const { chartData } = useSelector((state) => state.organization.incidentStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await organizationService.getIncidentStats();
      dispatch(setIncidentStats({ chartData: data.chartData, recentIncidents: data.recentIncidents }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#37322F]" />
          <h3 className="text-lg font-semibold text-[#37322F]">Incidents per Day</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-[#37322F]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#37322F]" />
          <h3 className="text-lg font-semibold text-[#37322F]">Incidents per Day</h3>
        </div>
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-[#37322F]" />
        <h3 className="text-lg font-semibold text-[#37322F]">Incidents per Day (Last 7 Days)</h3>
      </div>

      <div className="flex items-end gap-2 h-48">
        {chartData.map((day) => {
          const heightPct = (day.count / maxCount) * 100;
          const label = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-[#37322F]">{day.count || 0}</span>
              <div className="w-full flex items-end justify-center h-36">
                <div
                  className="w-full max-w-[40px] rounded-t-md bg-[#37322F] transition-all duration-300 hover:bg-[#37322F]/80"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className="text-xs text-[#605A57]">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
