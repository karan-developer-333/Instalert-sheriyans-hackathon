import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/admin.service";
import { fetchOrgSuccess } from "../../store/slices/organization.slice";
import { Building2, Plus, Loader2, CheckCircle, AlertCircle, X, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export default function CreateOrgPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ organizationName: "", description: "", username: "" });
  const [inviteEmails, setInviteEmails] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.organizationName || !form.username) {
      setError("Organization name and username are required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await adminService.createOrganization({ organizationName: form.organizationName, username: form.username });
      setSuccess(`Organization "${form.organizationName}" created successfully!`);
      dispatch(fetchOrgSuccess(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#37322F]/10 rounded-lg">
          <Building2 className="w-6 h-6 text-[#37322F]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#37322F]">Create Organization</h1>
          <p className="text-sm text-[#605A57]">Set up your workspace and invite team members</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto">
            <X className="w-4 h-4 text-green-400" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        <Card className="border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Basic information about your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgDesc">Description</Label>
                <Textarea
                  id="orgDesc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does your organization do?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminUsername">Admin Username</Label>
                <Input
                  id="adminUsername"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="org-admin"
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-[#37322F] hover:bg-[#37322F]/90">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Organization
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Invite Team Members
            </CardTitle>
            <CardDescription>Add up to 2 initial team members (Free plan limit: 3 total)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inviteEmails.map((email, i) => (
                <div key={i} className="space-y-2">
                  <Label>Email {i + 1}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const updated = [...inviteEmails];
                      updated[i] = e.target.value;
                      setInviteEmails(updated);
                    }}
                    placeholder="teammate@example.com"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-[#605A57] mt-4">
              Team members will receive an invitation email once the organization is created.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
