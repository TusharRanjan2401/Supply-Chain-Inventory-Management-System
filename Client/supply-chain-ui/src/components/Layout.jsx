import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext";
import {
  FiActivity,
  FiBox,
  FiHome,
  FiPackage,
  FiTruck,
  FiBell,
} from "react-icons/fi";

export const Layout = ({ children }) => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.length;
  const latestNotifications = notifications.slice(0, 6);
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) =>
    "app-nav-item" + (isActive ? " app-nav-item-active" : "");

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="app-sidebar-header">
          <div className="app-title">
            <FiActivity size={18} />
            SCIM Console
            <span className="app-title-badge">LIVE</span>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          <NavLink to="/dashboard" className={navClass}>
            <span className="app-nav-item-icon">
              <FiHome />
            </span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/orders" className={navClass}>
            <span className="app-nav-item-icon">
              <FiPackage />
            </span>
            <span>Orders</span>
          </NavLink>
          <NavLink to="/inventory" className={navClass}>
            <span className="app-nav-item-icon">
              <FiBox />
            </span>
            <span>Inventory</span>
          </NavLink>
          <NavLink to="/shipments" className={navClass}>
            <span className="app-nav-item-icon">
              <FiTruck />
            </span>
            <span>Shipments</span>
          </NavLink>
          <NavLink to="/notifications" className={navClass}>
            <span className="app-nav-item-icon">
              <FiBell />
            </span>
            <span>Notifications</span>
          </NavLink>
        </nav>

        <div className="app-sidebar-footer">
          Supply Chain &amp; Inventory Microservices
          <br />
          <span style={{ fontSize: 10, opacity: 0.7 }}>
            Order · Inventory · Shipment · Notification · Email
          </span>
        </div>
      </aside>

      {/* Main */}
      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="app-topbar-left">
            <div className="app-env-label">Supply Chain & Inventory Management Portal</div>
          </div>

          <div className="app-topbar-right">
            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              {/* <span style={{ opacity: 0.8 }}>Kafka · WebSocket · Resilience4j</span> */}
            </div>

            <div style={{ position: "relative" }}>
              <button
                className="app-bell-btn"
                onClick={() => setOpen((prev) => !prev)}
              >
                <FiBell size={14} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="app-bell-count">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {open && (
                <div className="app-bell-dropdown">
                  <div className="app-bell-header">
                    <span>Recent notifications</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      {unreadCount} total
                    </span>
                  </div>
                  <div className="app-bell-list">
                    {latestNotifications.length === 0 && (
                      <div className="app-bell-item" style={{ fontSize: 12 }}>
                        No notifications received in this session yet.
                      </div>
                    )}
                    {latestNotifications.map((n) => (
                      <div
                        key={n.notificationId}
                        className="app-bell-item"
                      >
                        <div className="app-bell-type">{n.type}</div>
                        <div className="app-bell-message">{n.message}</div>
                        <div className="app-bell-time">
                          {n.timestamp
                            ? new Date(n.timestamp).toLocaleString()
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};
