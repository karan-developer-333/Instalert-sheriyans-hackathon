import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, lazy, Suspense } from 'react';
import { loginSuccess, loginFailure } from './store/slices/auth.slice';
import { initSocket } from './utils/socket/socket';
import Layout from './ui/components/Layout';
import ProtectedRoute from './ui/components/ProtectedRoute';
import { ROLES } from './utils/constants';
import authService from './services/auth.service';
import { userService } from './services/user.service';
import { useCookies } from 'react-cookie';

const LoginPage = lazy(() => import('./ui/pages/LoginPage'));
const RegisterPage = lazy(() => import('./ui/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./ui/pages/VerifyEmailPage'));
const AdminDashboard = lazy(() => import('./ui/pages/AdminDashboard'));
const OrgDashboard = lazy(() => import('./ui/pages/OrgDashboard'));
const UserOrgPage = lazy(() => import('./ui/pages/UserOrgPage'));
const IncidentDetailPage = lazy(() => import('./ui/pages/IncidentDetailPage'));
const TeamPage = lazy(() => import('./ui/pages/TeamPage'));
const CreateOrgPage = lazy(() => import('./ui/pages/CreateOrgPage'));
const JoinOrgPage = lazy(() => import('./ui/pages/JoinOrgPage'));
const LandingPage = lazy(() => import('./ui/pages/LandingPage'));
const ProfilePage = lazy(() => import('./ui/pages/ProfilePage'));
const IncidentsPage = lazy(() => import('./ui/pages/IncidentsPage'));
const OrgSetupPage = lazy(() => import('./ui/pages/OrgSetupPage'));
const ApiKeys = lazy(() => import('./ui/pages/ApiKeys'));
const ForgotPasswordPage = lazy(() => import('./ui/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./ui/pages/ResetPasswordPage'));

function RoleBasedRedirect() {
  const { role, isAuthenticated } = useSelector((state) => state.auth);
  const [checkingOrg, setCheckingOrg] = useState(true);
  const [hasOrg, setHasOrg] = useState(null);

  useEffect(() => {
    const check = async () => {
      if (!isAuthenticated || role === ROLES.ADMIN) {
        setCheckingOrg(false);
        setHasOrg(true);
        return;
      }
      try {
        const data = await userService.checkHasOrganization();
        setHasOrg(data.hasOrganization);
      } catch {
        setHasOrg(false);
      } finally {
        setCheckingOrg(false);
      }
    };
    check();
  }, [isAuthenticated, role]);

  if (checkingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#37322F] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#605A57]">Checking...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && role === ROLES.USER && !hasOrg) {
    return <Navigate to="/dashboard/org-setup" replace />;
  }

  if (role === ROLES.ADMIN) return <Navigate to="/dashboard/admin" replace />;
  if (role === ROLES.ORGANIZATION) return <Navigate to="/dashboard/incidents" replace />;
  return <Navigate to="/dashboard/user" replace />;
}

function AuthLoader() {
  const dispatch = useDispatch();
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const data = await authService.getMe();
        if (!data?.user) {
          throw new Error("Invalid response from server: user data missing");
        }
        if (!cancelled) {
          dispatch(loginSuccess({ user: data.user, role: data.user.role }));
        }
      } catch {
        if (!cancelled) {
          dispatch(loginFailure('Not authenticated'));
        }
      } finally {
        if (!cancelled) {
          setDone(true);
        }
      }
    };

    initSocket();
    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (!done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#37322F] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#605A57]">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#37322F] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#605A57]">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthLoader />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleBasedRedirect />} />

            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="organization"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ORGANIZATION]}>
                  <OrgDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="organization/create-org"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ORGANIZATION]}>
                  <CreateOrgPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="org-setup"
              element={
                <ProtectedRoute allowedRoles={[ROLES.USER]}>
                  <OrgSetupPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="user"
              element={
                <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]}>
                  <UserOrgPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="incidents"
              element={
                <ProtectedRoute>
                  <IncidentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="incidents/:id"
              element={
                <ProtectedRoute>
                  <IncidentDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="team"
              element={
                <ProtectedRoute>
                  <TeamPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="join-org"
              element={
                <ProtectedRoute>
                  <JoinOrgPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="api-keys"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ORGANIZATION]}>
                  <ApiKeys />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
