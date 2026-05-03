export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  ORGANIZATION: "organization",
};

export const INCIDENT_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  CLOSED: "closed",
};

export const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

export const STATUS_COLORS = {
  open: "bg-green-100 text-green-700 border-green-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  closed: "bg-red-100 text-red-700 border-red-200",
};

export const ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  ADMIN: "/dashboard/admin",
  ORGANIZATION: "/dashboard/organization",
  USER: "/dashboard/user",
  INCIDENT_DETAIL: "/dashboard/incidents/:id",
};
