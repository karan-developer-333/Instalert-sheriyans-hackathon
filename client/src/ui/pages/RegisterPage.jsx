import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginStart, loginSuccess, loginFailure } from "../../store/slices/auth.slice";
import { authService } from "../../services/auth.service";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setFieldError("Password must be at least 6 characters");
      return;
    }
    setFieldError("");
    dispatch(loginStart());
    try {
      const data = await authService.register(form);
      if (data.requiresVerification) {
        dispatch(loginFailure(null));
        navigate("/auth/verify-email", { state: { email: data.email } });
      } else if (data.user) {
        if (!data?.user) {
          throw new Error("Invalid response from server: user data missing");
        }
        dispatch(loginSuccess({ user: data.user, role: data.user.role }));
        navigate("/dashboard");
      }
    } catch (err) {
      dispatch(loginFailure(err.error || err.message || "Registration failed"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#37322F]">InstaAlert</h1>
          <p className="text-[#605A57] mt-2 text-pretty">Create your account to get started</p>
        </div>

        <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#37322F]" />
              <CardTitle className="text-xl">Create account</CardTitle>
            </div>
            <CardDescription>Fill in your details below</CardDescription>
          </CardHeader>
          <CardContent>
            {(error || fieldError) && (
              <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error || fieldError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="johndoe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-[#37322F] hover:bg-[#37322F]/90">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-[#605A57] mt-6">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-[#37322F] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
