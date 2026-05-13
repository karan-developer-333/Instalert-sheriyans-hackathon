import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { organizationService } from "../../services/organization.service";
import { fetchEmployeesSuccess, fetchOrgStart, fetchOrgFailure, setEmployeesPage, setEmployeesLimit } from "../../store/slices/organization.slice";
import ConfirmDialog from "../components/ConfirmDialog";
import { SkeletonEmployeeRow } from "../components/Skeleton";
import { Users, Loader2, AlertCircle, X, Search, UserMinus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import Pagination from "../components/Pagination";

export default function TeamPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, organization, loading, error, employeesPagination } = useSelector((state) => state.organization);
  const { user, role } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState(null);
  const [actionError, setActionError] = useState("");
  const [confirmRemoveEmployee, setConfirmRemoveEmployee] = useState(null);

  const loadTeam = useCallback(async () => {
    dispatch(fetchOrgStart());
    try {
      const empData = await organizationService.getEmployees({
        page: employeesPagination.currentPage,
        limit: employeesPagination.limit,
      });
      dispatch(fetchEmployeesSuccess(empData));
    } catch (err) {
      dispatch(fetchOrgFailure(err.message));
    }
  }, [dispatch, employeesPagination.currentPage, employeesPagination.limit]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handlePageChange = (newPage) => {
    dispatch(setEmployeesPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setEmployeesLimit(newLimit));
  };

  const handleRemoveEmployee = async (userId) => {
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-[#37322F]/10 rounded-lg shrink-0">
          <Users className="w-6 h-6 text-[#37322F]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#37322F] truncate">Team Members</h1>
          <p className="text-sm text-[#605A57] truncate">
            {organization?.organizationName ? organization.organizationName : "All Organizations"} ({employeesPagination.totalCount || employees.length} members)
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
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonEmployeeRow key={i} />
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card className="border-[rgba(55,50,47,0.12)]">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-[#605A57]/30 mx-auto mb-3" />
            <p className="text-[#605A57]">{search ? "No matching members found." : "No team members yet."}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {filteredEmployees.map((emp) => (
              <Card key={emp._id} className="border-[rgba(55,50,47,0.12)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-[#37322F] text-white text-sm">
                        {emp.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#37322F] truncate">{emp.username}</p>
                      <p className="text-xs text-[#605A57] truncate">{emp.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={emp.organizationRole === "owner" ? "default" : "outline"}>
                          {emp.organizationRole || emp.role}
                        </Badge>
                        {role === "organization" && emp.organizationRole !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmRemoveEmployee(emp._id)}
                            disabled={removing === emp._id}
                            className="text-[#605A57] hover:text-red-600 hover:bg-red-50 ml-auto"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

            <div className="hidden sm:block">
              <Card className="border-[rgba(55,50,47,0.12)]">
                <CardContent className="p-0">
                  {filteredEmployees.map((emp, index) => (
                    <div key={emp._id}>
                      {index > 0 && <Separator />}
                      <div className="flex items-center justify-between px-6 py-4 hover:bg-[#F7F5F3] transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback className="bg-[#37322F] text-white text-sm">
                              {emp.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#37322F] truncate">{emp.username}</p>
                            <p className="text-xs text-[#605A57] truncate">{emp.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant={emp.organizationRole === "owner" ? "default" : "outline"}>
                            {emp.organizationRole || emp.role}
                          </Badge>
                          {role === "organization" && emp.organizationRole !== "owner" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setConfirmRemoveEmployee(emp._id)}
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
          </div>

          <Pagination
            currentPage={employeesPagination.currentPage}
            totalPages={employeesPagination.totalPages}
            totalCount={employeesPagination.totalCount}
            limit={employeesPagination.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}

      <ConfirmDialog
        open={!!confirmRemoveEmployee}
        onOpenChange={() => setConfirmRemoveEmployee(null)}
        title="Remove Employee"
        description="Remove this employee from the organization?"
        confirmLabel="Remove"
        onConfirm={() => {
          if (confirmRemoveEmployee) handleRemoveEmployee(confirmRemoveEmployee);
          setConfirmRemoveEmployee(null);
        }}
      />
    </div>
  );
}
