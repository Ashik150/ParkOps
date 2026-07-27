export const formatDateTime = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatDuration = (minutesOrStart, fromStart = false) => {
  const minutes = fromStart
    ? Math.max(1, Math.ceil((Date.now() - new Date(minutesOrStart)) / 60000))
    : Number(minutesOrStart || 0);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) return `${remainingMinutes} min`;
  return `${hours}h ${remainingMinutes}m`;
};

export const getInitials = (name = "Admin") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const actionLabel = (action = "") =>
  ({
    ADMIN_CREATED: "Admin created",
    AUTH_LOGIN: "Admin login",
    PARKING_ENTRY: "Vehicle entry",
    PARKING_EXIT: "Vehicle exit",
    EMERGENCY_GATE_OPENED: "Emergency gate opened",
    EMERGENCY_GATE_CLOSED: "Emergency gate closed",
  })[action] || action.replaceAll("_", " ").toLowerCase();
