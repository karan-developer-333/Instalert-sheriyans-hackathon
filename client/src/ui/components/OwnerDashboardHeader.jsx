import IncidentStatsCard from "./IncidentStatsCard";
import RecentIncidentsCard from "./RecentIncidentsCard";

export default function OwnerDashboardHeader() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <IncidentStatsCard />
      <RecentIncidentsCard />
    </div>
  );
}
