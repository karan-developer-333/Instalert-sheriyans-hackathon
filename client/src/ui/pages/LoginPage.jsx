import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginStart, loginSuccess, loginFailure, clearError } from "../../store/slices/auth.slice";
import authService from "../../services/auth.service";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const data = await authService.login(form);
      if (!data?.user) {
        throw new Error("Invalid response from server: user data missing");
      }
      dispatch(loginSuccess({ user: data.user, role: data.user.role }));
      navigate("/dashboard");
    } catch (err) {
      if (err.requiresVerification) {
        dispatch(loginFailure(null));
        navigate("/auth/verify-email", { state: { email: err.email || form.email } });
      } else {
        dispatch(loginFailure(err.message || "Login failed"));
      }
    }
  };

  const handleGithub = () => {
    authService.githubLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#37322F]">InstaAlert</h1>
          <p className="text-[#605A57] mt-2 text-pretty">Effortless Custom Contract Billing</p>
        </div>

        <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#37322F]" />
              <CardTitle className="text-xl">Sign in</CardTitle>
            </div>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {(error) && (
              <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign in
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <div className="absolute inset-0 flex justify-center text-sm">
                <span className="px-2 bg-white text-[#605A57]">or continue with</span>
              </div>
            </div>

            <Button variant="outline" onClick={handleGithub} className="w-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>

            <p className="text-center text-sm text-[#605A57] mt-6">
              Don&apos;t have an account?{" "}
              <Link to="/auth/register" className="text-[#37322F] font-medium hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-center text-sm text-[#605A57] mt-2">
              <Link to="/auth/forgot-password" className="text-[#37322F] hover:underline">
                Forgot password?
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
