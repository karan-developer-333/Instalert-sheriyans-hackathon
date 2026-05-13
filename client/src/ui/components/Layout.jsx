import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/auth.slice";
import {
  Shield,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  KeyRound,
} from "lucide-react";
import { ROLES } from "../../utils/constants";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Separator } from "./ui/separator";
import authService from "../../services/auth.service";

const MOBILE_BP = 768;
const DESKTOP_BP = 1024;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [screenSize, setScreenSize] = useState("desktop");

  useEffect(() => {
    const determine = () => {
      const w = window.innerWidth;
      if (w < MOBILE_BP) setScreenSize("mobile");
      else if (w < DESKTOP_BP) setScreenSize("tablet");
      else setScreenSize("desktop");
    };
    determine();
    window.addEventListener("resize", determine);
    return () => window.removeEventListener("resize", determine);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout API error:", e);
    }
    dispatch(logout());
    navigate("/auth/login");
  };

  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";
  const isDesktop = screenSize === "desktop";

  const navItems = [
    {
      label: "Dashboard",
      icon: Shield,
      path:
        role === ROLES.ADMIN
          ? "/dashboard/admin"
          : role === ROLES.ORGANIZATION
            ? "/dashboard/organization"
            : "/dashboard/user",
    },
    {
      label: "Incidents",
      icon: FileText,
      path: "/dashboard/incidents",
    },
    {
      label: "Team",
      icon: Users,
      path: "/dashboard/team",
    },
    {
      label: "Profile",
      icon: User,
      path: "/dashboard/profile",
    },
    {
      label: "API Keys",
      icon: KeyRound,
      path: "/dashboard/api-keys",
      roles: [ROLES.ORGANIZATION],
    },
  ];

  const visibleNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  const isActive = (path) => {
    if (path.includes("?")) path = path.split("?")[0];
    return location.pathname === path;
  };

  const showLabels = isMobile || (isDesktop && !collapsed);

  const sidebarWidth = isMobile
    ? "w-64"
    : isTablet
      ? "w-16"
      : collapsed
        ? "w-16"
        : "w-64";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen bg-[#F7F5F3] flex overflow-hidden">
        {/* Mobile overlay */}
        {isMobile && mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg border border-[rgba(55,50,47,0.12)] shadow-sm"
          >
            <Menu className="w-5 h-5 text-[#37322F]" />
          </button>
        )}

        <aside
          className={`bg-white border-r border-[rgba(55,50,47,0.12)] flex flex-col transition-all duration-300 flex-shrink-0 ${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 w-64 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
              : `static ${sidebarWidth}`
          }`}
        >
          {/* Header */}
          <div
            className={`border-b border-[rgba(55,50,47,0.12)] py-4 ${showLabels ? "px-6" : "px-3"}`}
          >
            {isMobile ? (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-serif font-bold text-[#37322F]">
                    InstaAlert
                  </h1>
                  <p className="text-xs text-[#605A57] capitalize">{role}</p>
                </div>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5 text-[#605A57]" />
                </button>
              </div>
            ) : showLabels ? (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-serif font-bold text-[#37322F]">
                    InstaAlert
                  </h1>
                  <p className="text-xs text-[#605A57] capitalize">{role}</p>
                </div>
                {isDesktop && (
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-[#605A57] hover:text-[#37322F] transition-colors p-1.5 rounded-lg hover:bg-[#F7F5F3]"
                    title="Collapse sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-serif font-bold text-[#37322F]">
                  I
                </span>
                {isDesktop && (
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-[#605A57] hover:text-[#37322F] transition-colors p-1.5 rounded-lg hover:bg-[#F7F5F3]"
                    title="Expand sidebar"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 space-y-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path.split("?")[0]);
              const iconOnly = !showLabels;

              if (iconOnly) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (isMobile) setMobileOpen(false);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-colors ${
                          active
                            ? "bg-[#37322F] text-white"
                            : "text-[#605A57] hover:bg-[#F7F5F3] hover:text-[#37322F]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-[#37322F] text-white"
                      : "text-[#605A57] hover:bg-[#F7F5F3] hover:text-[#37322F]"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <Separator className="mx-4" />

          {/* User section */}
          <div
            className={`p-3 ${!showLabels ? "flex flex-col items-center" : ""}`}
          >
            {showLabels ? (
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#37322F] text-white text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#37322F] truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-[#605A57] truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            ) : (
              <Avatar className="w-8 h-8 mb-2">
                <AvatarFallback className="bg-[#37322F] text-white text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className={`w-full text-[#605A57] hover:text-red-600 hover:bg-red-50 ${!showLabels ? "justify-center p-2.5" : ""}`}
              size={!showLabels ? "icon" : "default"}
            >
              <LogOut className="w-4 h-4" />
              {showLabels && <span>Logout</span>}
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className={isMobile ? "pt-16" : ""}>
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
