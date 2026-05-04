import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLeaderboard } from "../../store/slices/organization.slice";
import { organizationService } from "../../services/organization.service";
import { Trophy, Loader2, AlertCircle, Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function Leaderboard() {
  const dispatch = useDispatch();
  const leaderboard = useSelector((state) => state.organization.leaderboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await organizationService.getLeaderboard();
      dispatch(setLeaderboard(data.leaderboard));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rankIcon = (rank) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-[#605A57]">#{rank}</span>;
  };

  const scoreBarWidth = (score, maxScore) => {
    if (maxScore === 0) return 0;
    return (score / maxScore) * 100;
  };

  const maxScore = Math.max(...leaderboard.map((u) => u.working_score), 0);

  if (loading) {
    return (
      <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-[#37322F]" />
          <h3 className="text-lg font-semibold text-[#37322F]">Top Performers</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-[#37322F]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-[#37322F]" />
          <h3 className="text-lg font-semibold text-[#37322F]">Top Performers</h3>
        </div>
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-[#37322F]" />
          <h3 className="text-lg font-semibold text-[#37322F]">Top Performers</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-[#605A57]">
          <Trophy className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No scores yet. Close an incident to start scoring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#37322F]" />
          <h3 className="text-lg font-semibold text-[#37322F]">Top Performers</h3>
        </div>
        <p className="text-xs text-[#605A57]">Scores reset monthly</p>
      </div>

      <div className="space-y-3">
        {leaderboard.map((user) => (
          <div
            key={user.userId}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              user.rank <= 3 ? "bg-[#F7F5F3]" : ""
            }`}
          >
            <div className="w-8 flex justify-center">{rankIcon(user.rank)}</div>

            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-[#37322F] text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#37322F] truncate">{user.username}</p>
              <div className="mt-1 w-full bg-[#F7F5F3] rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#37322F] transition-all duration-500"
                  style={{ width: `${scoreBarWidth(user.working_score, maxScore)}%` }}
                />
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-[#37322F]">{user.working_score}</p>
              <p className="text-xs text-[#605A57]">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
