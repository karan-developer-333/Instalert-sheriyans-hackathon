import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authService from '../../services/auth.service.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();

  const [otp, ] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await authService.resetPassword(email, otp, newPassword);
      setMessage('Password reset successfully! You can now login with your new password.');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[#37322F]">InstaAlert</h1>
          <p className="text-[#605A57] mt-2">Set new password</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[rgba(55,50,47,0.12)] p-6">
          {message ? (
            <div className="text-center">
              <div className="text-green-600 mb-4">{message}</div>
              <Link to="/auth/login" className="text-sm text-[#37322F] hover:underline">
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>
              )}

              <div>
                <label className="text-sm font-medium text-[#37322F]">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={!!email}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#37322F]">Reset Code</label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the code from email"
                  required
                />
              </div>

              {otp.length >= 6 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-[#37322F]">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#37322F]">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                      minLength={6}
                    />
                  </div>
                </>
              )}

              <Button type="submit" disabled={loading || otp.length < 6 || !newPassword || !confirmPassword} className="w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <p className="text-center text-sm text-[#605A57]">
                <Link to="/auth/login" className="hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
