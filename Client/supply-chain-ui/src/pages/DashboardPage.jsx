// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNotifications } from "../context/NotificationsContext";
import { FiPackage, FiBox, FiTruck, FiBell, FiRefreshCcw } from "react-icons/fi";

const API_BASE = "http://localhost:8080/api"; // API Gateway

export const DashboardPage = () => {
  const { notifications } = useNotifications();

  const [ordersToday, setOrdersToday] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [shipmentsInTransit, setShipmentsInTransit] = useState(0);

  const [loading, setLoading] = useState({
    orders: false,
    inventory: false,
    shipments: false,
  });

  const [lastUpdated, setLastUpdated] = useState(null);

  // helper to normalize backend list (array or { content: [] })
  const normalizeList = async (res) => {
    const data = await res.json();
    return Array.isArray(data) ? data : data.content || [];
  };

  const fetchOrders = async () => {
    setLoading((s) => ({ ...s, orders: true }));
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const list = await normalizeList(res);
      // count orders created today (local date)
      const todayStr = new Date().toDateString();
      const count = list.reduce((acc, o) => {
        if (!o) return acc;
        const createdAt = o.createdAt || o.createdAtDate || o.createdAtTime || o.created; // defensive
        if (!createdAt) return acc;
        try {
          const d = new Date(createdAt);
          if (d.toDateString() === todayStr) return acc + 1;
        } catch {}
        return acc;
      }, 0);
      setOrdersToday(count);
    } catch (e) {
      console.error("orders fetch error", e);
      setOrdersToday(0);
    } finally {
      setLoading((s) => ({ ...s, orders: false }));
    }
  };

  const fetchInventory = async () => {
    setLoading((s) => ({ ...s, inventory: true }));
    try {
      const res = await fetch(`${API_BASE}/inventory`);
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const list = await normalizeList(res);
      const count = list.reduce((acc, it) => {
        const avail = Number(it.availableQty ?? it.available ?? 0);
        const thresh = Number(it.threshold ?? 0);
        if (avail <= thresh) return acc + 1;
        return acc;
      }, 0);
      setLowStock(count);
    } catch (e) {
      console.error("inventory fetch error", e);
      setLowStock(0);
    } finally {
      setLoading((s) => ({ ...s, inventory: false }));
    }
  };

  const fetchShipments = async () => {
    setLoading((s) => ({ ...s, shipments: true }));
    try {
      const res = await fetch(`${API_BASE}/shipment`);
      if (!res.ok) throw new Error("Failed to fetch shipments");
      const list = await normalizeList(res);
      // define "in-transit" statuses (adjust if your backend uses different strings)
      const inTransitStatuses = new Set(["IN_TRANSIT", "OUT_FOR_DELIVERY", "IN_TRANSIT_DETOURED"]);
      const count = list.reduce((acc, s) => {
        const st = (s.status || "").toUpperCase();
        if (inTransitStatuses.has(st)) return acc + 1;
        return acc;
      }, 0);
      setShipmentsInTransit(count);
    } catch (e) {
      console.error("shipments fetch error", e);
      setShipmentsInTransit(0);
    } finally {
      setLoading((s) => ({ ...s, shipments: false }));
    }
  };

  // fetch all metrics
  const fetchAll = async () => {
    await Promise.all([fetchOrders(), fetchInventory(), fetchShipments()]);
    setLastUpdated(new Date());
  };

  // initial load
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh when new notifications arrive so dashboard shows fresh session counts
  useEffect(() => {
    // notifications comes from context and updates frequently; we refresh only the notif tile count
    // but also refresh all metrics every time notifications length increases (lightweight)
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  const latestActivity = useMemo(() => {
    return notifications.slice(0, 6);
  }, [notifications]);

  const isAnyLoading = loading.orders || loading.inventory || loading.shipments;

  return (
    <div>
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-title">Control Center</div>
          <div className="dash-subtitle">
            Live overview of orders, inventory, shipments and notification
            events flowing through your microservices stack.
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="dash-chip">
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "999px",
                background: "#22c55e",
                marginRight: 8,
              }}
            />
            Connected
          </div>
          <button className="ghost-btn ghost-btn-sm" onClick={fetchAll} disabled={isAnyLoading}>
            <FiRefreshCcw />
            <span style={{ marginLeft: 6 }}>{isAnyLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ""}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="dash-metrics-grid">
        <div className="dash-metric-card">
          <div className="dash-metric-label">Orders (today)</div>
          <div className="dash-metric-value">{ordersToday}</div>
          <div className="dash-metric-sub">Orders created since midnight (local).</div>
          <div className="dash-metric-pill">
            <FiPackage style={{ marginRight: 6 }} />
            Orders
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-label">Low-stock SKUs</div>
          <div className="dash-metric-value">{lowStock}</div>
          <div className="dash-metric-sub">
            Items that are running low in stock.
          </div>
          <div className="dash-metric-pill">
            <FiBox style={{ marginRight: 6 }} />
            Inventory
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-label">Shipments in transit</div>
          <div className="dash-metric-value">{shipmentsInTransit}</div>
          <div className="dash-metric-sub">Shipments currently being transported.</div>
          <div className="dash-metric-pill">
            <FiTruck style={{ marginRight: 6 }} />
            Shipments
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-label">Notifications this session</div>
          <div className="dash-metric-value">{notifications.length}</div>
          <div className="dash-metric-sub">
           Notifications you received during this session.
          </div>
          <div className="dash-metric-pill">
            <FiBell style={{ marginRight: 6 }} />
            Events
          </div>
        </div>
      </div>

      {/* Lower content */}
      <div className="dash-lower-grid">
        {/* Left: placeholder */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">System snapshot</div>
              <div className="dash-card-subtitle">
               This dashboard reflects activity across your services—Order, Inventory, Shipment, Notification, and Email.
              </div>
            </div>
            <div className="dash-tag">Overview</div>
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8, lineHeight: 1.5 }}>
            As you place orders, adjust stock levels, or update shipment progress, each action triggers events that flow through the system. Notifications are processed, emails are sent, and this dashboard updates in real time to keep you informed.
          </div>
        </div>

        {/* Right: recent activity (from notifications) */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Recent activity</div>
              <div className="dash-card-subtitle">Stream of events from NotificationService (latest 6).</div>
            </div>
            <div className="dash-tag">Live feed</div>
          </div>

          <div className="dash-activity-list">
            {latestActivity.length === 0 && (
              <div style={{ fontSize: 12, color: "#9ca3af", padding: "6px 2px" }}>
                No events yet. Create an order, update inventory, or create a shipment to see events here.
              </div>
            )}

            {latestActivity.map((n) => (
              <div key={n.notificationId} className="dash-activity-item">
                <div className="dash-activity-type">{n.type}</div>
                <div className="dash-activity-message">{n.message}</div>
                <div className="dash-activity-meta">
                  {n.userEmail && <span>{n.userEmail} · </span>}
                  {n.timestamp ? new Date(n.timestamp).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
