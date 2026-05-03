import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateRole } from "../../store/slices/auth.slice";
import { fetchOrgSuccess } from "../../store/slices/organization.slice";
import { userService } from "../../services/user.service";
import { Building2, Plus, Hash, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import JoinCodeInput from "../components/JoinCodeInput";

export default function OrgSetupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mode, setMode] = useState(null);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await userService.createMyOrganization(orgName.trim());
      dispatch(updateRole(data.role));
      dispatch(fetchOrgSuccess({ organization: data.organization, memberCount: 0 }));
      setSuccess(`Organization "${data.organization.organizationName}" created! Redirecting...`);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrg = async (joinCode) => {
    setError("");
    try {
      await userService.joinOrganization(joinCode);
      setSuccess("Successfully joined the organization! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
        <div className="w-full max-w-md">
          <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-[#37322F]">{success}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
        <div className="w-full max-w-md">
          <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#37322F]" />
                <CardTitle className="text-xl">Create Organization</CardTitle>
              </div>
              <CardDescription>Choose a name for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="My Organization"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-[#37322F] hover:bg-[#37322F]/90">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                  Create Organization
                </Button>
              </form>

              <Separator className="my-6" />

              <Button
                variant="ghost"
                className="w-full text-[#605A57]"
                onClick={() => {
                  setMode(null);
                  setError("");
                }}
              >
                Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
        <div className="w-full max-w-md">
          <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#37322F]" />
                <CardTitle className="text-xl">Join Organization</CardTitle>
              </div>
              <CardDescription>Enter the invite code shared by your admin</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <JoinCodeInput onJoin={handleJoinOrg} />

              <Separator className="my-6" />

              <Button
                variant="ghost"
                className="w-full text-[#605A57]"
                onClick={() => {
                  setMode(null);
                  setError("");
                }}
              >
                Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#37322F]">Welcome, {user?.username}!</h1>
          <p className="text-[#605A57] mt-2">You need to join or create an organization to continue</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="border-[rgba(55,50,47,0.12)] shadow-sm cursor-pointer hover:border-[#37322F]/30 transition-colors"
            onClick={() => setMode("create")}
          >
            <CardHeader className="text-center">
              <div className="p-3 bg-[#37322F]/10 rounded-lg inline-flex mb-2">
                <Building2 className="w-7 h-7 text-[#37322F]" />
              </div>
              <CardTitle className="text-lg">Create Organization</CardTitle>
              <CardDescription>Start your own workspace and invite others</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#37322F] hover:bg-[#37322F]/90">
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </CardContent>
          </Card>

          <Card
            className="border-[rgba(55,50,47,0.12)] shadow-sm cursor-pointer hover:border-[#37322F]/30 transition-colors"
            onClick={() => setMode("join")}
          >
            <CardHeader className="text-center">
              <div className="p-3 bg-[#37322F]/10 rounded-lg inline-flex mb-2">
                <Hash className="w-7 h-7 text-[#37322F]" />
              </div>
              <CardTitle className="text-lg">Join Organization</CardTitle>
              <CardDescription>Join using an invite code from your admin</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Hash className="w-4 h-4" />
                Join
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
