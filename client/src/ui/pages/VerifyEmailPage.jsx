import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmailStart, verifyEmailSuccess, verifyEmailFailure, clearError } from "../../store/slices/auth.slice";
import { authService } from "../../services/auth.service";
import { Loader2, AlertCircle, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function VerifyEmailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const [otp, setOTP] = useState("");
  const [succes, setSuccess] = useState(false);
  const { loading, error } = useSelector((state) => state.auth);

  // Redirect to login if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/auth/login");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (otp.length < 6) return;
    dispatch(verifyEmailStart());
    try {
      const data = await authService.verifyEmail(email, otp);
      dispatch(verifyEmailSuccess({ user: data.user, role: data.user.role }));
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      dispatch(verifyEmailFailure(err.message || "Invalid OTP"));
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOTP(email);
      alert("New verification code sent to your email!");
    } catch (err) {
      alert(err.message || "Failed to resend code");
    }
  };

  if (succes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
        <Card className="border-[rgba(55,50,47,0.12)] shadow-sm w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#37322F] mb-2">Email Verified!</h2>
            <p className="text-sm text-[#605A57]">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-[#605A57] hover:text-[#37322F] mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#37322F]">InstaAlert</h1>
          <p className="text-[#605A57] mt-2">Verify your email address</p>
        </div>

        <Card className="border-[rgba(55,50,47,0.12)] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#37322F]" />
              <CardTitle className="text-xl">Verify Email</CardTitle>
            </div>
            <CardDescription>
              We've sent a 6-digit code to <strong>{email || "your email"}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium text-[#37322F]">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOTP(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-[#37322F] hover:bg-[#37322F]/90"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
              </Button>
            </form>

            <p className="text-center text-sm text-[#605A57] mt-6">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-[#37322F] font-medium hover:underline"
              >
                Resend code
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
