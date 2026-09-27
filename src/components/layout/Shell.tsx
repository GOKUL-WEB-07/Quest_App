import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../../stores/AppProvider";
import { Icon } from "../ui";
import { levelName } from "../../services/userService";
const nav = [
  ["/home", "home", "Home"],
  ["/discover", "compass", "Discover"],
  ["/quest/generate", "sparkles", "Find a quest"],
  ["/memories", "image", "Memories"],
  ["/profile", "people", "Profile"],
];
export function Shell() {
  const { data, error, toast, retry, clearError } = useApp();
  const location = useLocation();
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    const online = () => setOffline(!navigator.onLine);
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
  }, []);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link to="/home" className="brand">
          <span className="brand-icon">
            <Icon name="sparkles" size={24} />
          </span>
          sidequest<span className="brand-dot">.</span>
        </Link>
        <p className="brand-caption">A little out of the ordinary.</p>
        <nav aria-label="Main navigation">
          {nav.map(([to, icon, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""} ${icon === "sparkles" ? "quest-nav" : ""}`
              }
            >
              <Icon name={icon} />
              <span>{label}</span>
              {icon === "sparkles" && <span className="nav-plus">+</span>}
            </NavLink>
          ))}
          <div className="nav-divider" />
          <NavLink to="/saved" className="nav-link">
            <Icon name="bookmark" />
            Saved quests<span className="count">{data.favorites.length}</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="field-note">
            <Icon name="sun" size={25} />
            <p>
              Good stories start
              <br />
              with a little detour.
            </p>
            <span>Go make one.</span>
          </div>
          <Link to="/profile" className="sidebar-profile">
            <span className="avatar">
              {data.profile.displayName[0]?.toUpperCase() || "E"}
            </span>
            <div>
              <strong>{data.profile.displayName}</strong>
              <small>
                Level {data.profile.level} · {levelName(data.profile.level)}
              </small>
            </div>
            <Icon name="settings" size={18} />
          </Link>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <Link className="mobile-brand brand" to="/home">
            sidequest<span className="brand-dot">.</span>
          </Link>
          <span className="topbar-message">
            <span className="status-dot" /> A good day for a little adventure
          </span>
          <div className="topbar-actions">
            <span className="xp-pill">
              <Icon name="zap" size={15} />
              {data.profile.xp} XP
            </span>
            <Link to="/saved" className="icon-button" aria-label="Saved quests">
              <Icon name="bookmark" />
            </Link>
            <Link
              to="/profile"
              className="avatar small"
              aria-label="Your profile"
            >
              {data.profile.displayName[0]?.toUpperCase() || "E"}
            </Link>
          </div>
        </header>
        {offline && (
          <div className="notice" role="status">
            You’re offline. Your quests and progress stay on this device.
          </div>
        )}
        {error && (
          <div className="notice error" role="alert">
            <span>{error}</span>
            <button onClick={retry}>Retry</button>
            <button onClick={clearError} aria-label="Dismiss error">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Less scrolling. More living.</span>
          <span>Made for the plot.</span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {nav.map(([to, icon, label]) => (
          <NavLink
            key={to}
            to={to}
            className={icon === "sparkles" ? "center-quest" : ""}
          >
            <Icon name={icon} />
            <span>{label === "Find a quest" ? "Quest" : label}</span>
          </NavLink>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
