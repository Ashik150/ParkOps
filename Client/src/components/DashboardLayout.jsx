import {
  Bell,
  FileClock,
  Home,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getInitials } from "../utils/formatters";
import Brand from "./Brand";

const navigation = [
  { label: "Home", path: "/", icon: Home },
  { label: "Entry", path: "/entry", icon: LogIn },
  { label: "Exit", path: "/exit", icon: LogOut },
  { label: "Logs", path: "/logs", icon: FileClock },
];

const pageNames = {
  "/": "Overview",
  "/entry": "Vehicle entry",
  "/exit": "Vehicle exit",
  "/logs": "Activity logs",
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__top">
          <Brand />
          <button
            className="icon-button sidebar__close"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar__section-label">Workspace</div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__support-card">
          <span className="status-dot" />
          <div>
            <strong>System operational</strong>
            <small>Atlas database connected</small>
          </div>
        </div>

        <div className="sidebar__profile">
          <span className="avatar">{getInitials(user?.name)}</span>
          <div className="sidebar__profile-copy">
            <strong>{user?.name}</strong>
            <small>Administrator</small>
          </div>
          <button
            className="icon-button icon-button--dark"
            aria-label="Sign out"
            title="Sign out"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar__left">
            <button
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <span className="topbar__label">Admin dashboard</span>
              <strong>{pageNames[location.pathname] || "ParkOps"}</strong>
            </div>
          </div>
          <div className="topbar__right">
            <span className="topbar__date">
              {new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              }).format(new Date())}
            </span>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
            <span className="avatar avatar--small">{getInitials(user?.name)}</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
