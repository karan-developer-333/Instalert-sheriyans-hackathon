import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { loginSuccess, loginFailure, verifyEmailSuccess } from './store/slices/auth.slice';
import { initSocket } from './utils/socket/socket';
import Layout from './ui/components/Layout';
import ProtectedRoute from './ui/components/ProtectedRoute';
import LoginPage from './ui/pages/LoginPage';
import RegisterPage from './ui/pages/RegisterPage';
import VerifyEmailPage from './ui/pages/VerifyEmailPage';
import AdminDashboard from './ui/pages/AdminDashboard';
import OrgDashboard from './ui/pages/OrgDashboard';
import UserOrgPage from './ui/pages/UserOrgPage';
import IncidentDetailPage from './ui/pages/IncidentDetailPage';
import TeamPage from './ui/pages/TeamPage';
import CreateOrgPage from './ui/pages/CreateOrgPage';
import JoinOrgPage from './ui/pages/JoinOrgPage';
import LandingPage from './ui/pages/LandingPage';
import ProfilePage from './ui/pages/ProfilePage';
import IncidentsPage from './ui/pages/IncidentsPage';
import OrgSetupPage from './ui/pages/OrgSetupPage';
import { ROLES } from './utils/constants';
import { authService } from './services/auth.service';
import { userService } from './services/user.service';

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
    initSocket();

    const checkAuth = async () => {
      try {
        const data = await authService.getMe();
        dispatch(loginSuccess({ user: data.user, role: data.user.role }));
      } catch {
        dispatch(loginFailure('Not authenticated'));
      } finally {
        setDone(true);
      }
    };

    checkAuth();
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthLoader />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

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


        </Route>

        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
