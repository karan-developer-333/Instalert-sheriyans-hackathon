import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { organizationService } from "../../services/organization.service";
import { fetchEmployeesSuccess, fetchOrgStart, fetchOrgFailure } from "../../store/slices/organization.slice";
import { Users, Loader2, AlertCircle, X, Search, UserMinus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

export default function TeamPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, organization, loading, error } = useSelector((state) => state.organization);
  const { user, role } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    dispatch(fetchOrgStart());
    try {
      const empData = await organizationService.getEmployees();
      dispatch(fetchEmployeesSuccess(empData));
    } catch (err) {
      dispatch(fetchOrgFailure(err.message));
    }
  };

  const handleRemoveEmployee = async (userId) => {
    if (!confirm("Remove this employee from the organization?")) return;
    setRemoving(userId);
    try {
      await organizationService.removeEmployee(userId);
      loadTeam();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setRemoving(null);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.username?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#37322F]/10 rounded-lg">
          <Users className="w-6 h-6 text-[#37322F]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#37322F]">Team Members</h1>
          <p className="text-sm text-[#605A57]">
            {organization?.organizationName ? organization.organizationName : "All Organizations"} ({employees.length} members)
          </p>
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

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#605A57]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#37322F]" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card className="border-[rgba(55,50,47,0.12)]">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-[#605A57]/30 mx-auto mb-3" />
            <p className="text-[#605A57]">{search ? "No matching members found." : "No team members yet."}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[rgba(55,50,47,0.12)]">
          <CardContent className="p-0">
            {filteredEmployees.map((emp, i) => (
              <div key={emp._id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between px-6 py-4 hover:bg-[#F7F5F3] transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-[#37322F] text-white text-sm">
                        {emp.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-[#37322F]">{emp.username}</p>
                      <p className="text-xs text-[#605A57]">{emp.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={emp.organizationRole === "owner" ? "default" : "outline"}>
                      {emp.organizationRole || emp.role}
                    </Badge>
                    {role === "organization" && emp.organizationRole !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEmployee(emp._id)}
                        disabled={removing === emp._id}
                        className="text-[#605A57] hover:text-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
