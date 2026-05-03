import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrgStart, fetchOrgSuccess, fetchOrgFailure } from "../../store/slices/organization.slice";
import { organizationService } from "../../services/organization.service";
import { userService } from "../../services/user.service";
import { getSocket, joinOrganization } from "../../utils/socket/socket";
import { Building2, Loader2, AlertCircle, X, Users, Shield, User, Mail, ClipboardCopy } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import JoinCodeInput from "../components/JoinCodeInput";

export default function UserOrgPage() {
  const dispatch = useDispatch();
  const { organization, loading: orgLoading, error: orgError } = useSelector((state) => state.organization);
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrg();
  }, []);

  useEffect(() => {
    if (organization?.organizationJoinCode) {
      joinOrganization(organization.organizationJoinCode);
    }
  }, [organization]);

  const loadOrg = async () => {
    dispatch(fetchOrgStart());
    try {
      const orgData = await organizationService.getMyOrg();
      dispatch(fetchOrgSuccess(orgData));
    } catch (err) {
      if (err.status !== 404) {
        dispatch(fetchOrgFailure(err.message));
      }
    }
  };

  const handleJoin = async (joinCode) => {
    setError("");
    try {
      await userService.joinOrganization(joinCode);
      loadOrg();
    } catch (err) {
      setError(err.message);
    }
  };

  const copyJoinCode = () => {
    if (organization?.organizationJoinCode) {
      navigator.clipboard.writeText(organization.organizationJoinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (orgLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#37322F]" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-8 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#37322F]/10 rounded-lg">
            <Building2 className="w-6 h-6 text-[#37322F]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#37322F]">Organization</h1>
            <p className="text-sm text-[#605A57]">Join an organization to get started</p>
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

        <Card className="border-[rgba(55,50,47,0.12)]">
          <CardHeader className="pb-3">
            <CardTitle>Join an Organization</CardTitle>
            <CardDescription>Enter the join code shared by your organization owner</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinCodeInput onJoin={handleJoin} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#37322F]/10 rounded-lg">
          <Building2 className="w-6 h-6 text-[#37322F]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#37322F]">Organization</h1>
          <p className="text-sm text-[#605A57]">Your organization details</p>
        </div>
      </div>

      <Card className="border-[rgba(55,50,47,0.12)] mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{organization.organizationName}</CardTitle>
              <CardDescription>Organization Details</CardDescription>
            </div>
            {organization.organizationJoinCode && (
              <Button variant="outline" size="sm" onClick={copyJoinCode}>
                <ClipboardCopy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />

          {organization.owner && (
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#605A57]" />
              <div>
                <p className="text-xs text-[#605A57] uppercase tracking-wide">Owner</p>
                <p className="text-sm font-medium text-[#37322F]">{organization.owner.username}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#605A57]" />
            <div>
              <p className="text-xs text-[#605A57] uppercase tracking-wide">Members</p>
              <p className="text-sm font-medium text-[#37322F]">{organization.memberCount || 0} employees</p>
            </div>
          </div>

          {organization.organizationJoinCode && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-[#F7F5F3]">
                Code: {organization.organizationJoinCode}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
