import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/user.service";
import { Building2, Loader2, AlertCircle, X, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function JoinOrgPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError("Please enter a join code");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await userService.joinOrganization(joinCode.trim());
      setSuccess("Successfully joined the organization!");
      setTimeout(() => navigate("/dashboard/user"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="p-3 bg-[#37322F]/10 rounded-lg inline-flex mb-4">
          <Building2 className="w-8 h-8 text-[#37322F]" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#37322F]">Join an Organization</h1>
        <p className="text-sm text-[#605A57] mt-2">Enter the invite code provided by your organization admin</p>
      </div>

      {success && (
        <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-sm text-green-700">{success}</p>
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

      <Card className="border-[rgba(55,50,47,0.12)]">
        <CardHeader>
          <CardTitle>Invite Code</CardTitle>
          <CardDescription>Enter the code in the format KALKI-XXXXXXXXX</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Join Code</Label>
              <Input
                id="joinCode"
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="KALKI-XXXXXXXXX"
                className="uppercase tracking-wider text-center text-lg"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#37322F] hover:bg-[#37322F]/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Join Organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
