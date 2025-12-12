// src/pages/NotificationsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNotifications } from "../context/NotificationsContext"; 
import {
  FiBell,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiTrash2,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";

/**
 * NotificationsPage
 *
 * - Uses useNotifications() to read the live notifications array provided
 * - Keeps a local enriched copy (read flag, id normalization) stored in localStorage
 * - Shows filters, search, unread-only toggle, detail modal and actions
 */

const STORAGE_KEY = "ui_notifications_v1";
const MAX_STORE = 400;
const short = (s, n = 120) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s);

const iconForType = (type) => {
  if (!type) return <FiBell />;
  const t = String(type).toUpperCase();
  if (t.includes("ERROR") || t.includes("FAIL")) return <FiAlertTriangle />;
  if (t.includes("WARN") || t.includes("LOW_STOCK")) return <FiAlertTriangle />;
  if (t.includes("INFO") || t.includes("TEST")) return <FiInfo />;
  return <FiBell />;
};

const normalizeIncoming = (raw) => {
  // raw may be object or string; normalize to { id, type, message, userEmail, timestamp, raw }
  let obj = raw;
  if (!obj) obj = {};
  // If it's a string, keep as message
  if (typeof obj === "string") {
    return {
      notificationId: `n-${Date.now()}`,
      type: "UNKNOWN",
      message: obj,
      userEmail: "",
      timestamp: new Date().toISOString(),
      raw: obj,
    };
  }
  // try common fields
  const id = obj.notificationId || obj.id || obj.notification_id || `n-${Date.now()}`;
  const type = obj.type || obj.eventType || (obj.event && (obj.event.eventType || obj.event.type)) || "UNKNOWN";
  const message = obj.message || obj.msg || obj.body || JSON.stringify(obj).slice(0, 400);
  const userEmail = obj.userEmail || obj.recipient || obj.email || obj.to || "";
  const timestamp = obj.timestamp || obj.eventTime || obj.time || new Date().toISOString();

  return {
    notificationId: String(id),
    type: typeof type === "object" ? JSON.stringify(type) : String(type),
    message,
    userEmail,
    timestamp,
    raw: obj,
  };
};

export const NotificationsPage = () => {
  const providerNotifications = useNotifications().notifications || [];
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  // UI controls
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [detail, setDetail] = useState({ open: false, item: null });
  const highlightRef = useRef({}); // transient highlight map for incoming items

  // persist helper
  const persist = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_STORE)));
    } catch (e) {
      // ignore storage errors
    }
  };

  // merge new notifications from provider into local items
  useEffect(() => {
    if (!Array.isArray(providerNotifications) || providerNotifications.length === 0) return;

    // providerNotifications are newest-first (your provider does that). We'll iterate and merge.
    setItems((prev) => {
      const byId = new Map(prev.map((p) => [p.notificationId, p]));
      const incoming = [];

      for (let raw of providerNotifications) {
        const normalized = normalizeIncoming(raw);
        // if exists, prefer provider's value (update)
        const exists = byId.get(normalized.notificationId);
        if (exists) {
          // merge raw fields but preserve read flag from existing
          const merged = { ...exists, ...normalized, raw: normalized.raw, // update raw
            read: exists.read ?? false,
          };
          byId.set(merged.notificationId, merged);
        } else {
          const entry = { ...normalized, read: false };
          byId.set(entry.notificationId, entry);
          incoming.push(entry);
        }
      }

      // build new list: incoming (newest first) + existing (excluding duplicates)
      // Keep array length under MAX_STORE
      const deduped = Array.from(byId.values())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, MAX_STORE);

      // highlight incoming ones for brief UI animation
      for (let it of incoming) {
        highlightRef.current[it.notificationId] = true;
        setTimeout(() => {
          delete highlightRef.current[it.notificationId];
          // trigger a small re-render
          setItems((cur) => [...cur]);
        }, 2800);
      }

      persist(deduped);
      return deduped;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerNotifications]);

  // filters & search
  const types = useMemo(() => {
    const s = new Set(items.map((i) => (i.type ? String(i.type) : "UNKNOWN")));
    return ["ALL", ...Array.from(s)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (unreadOnly && it.read) return false;
      if (!q) return true;
      if ((it.notificationId || "").toLowerCase().includes(q)) return true;
      if ((it.userEmail || "").toLowerCase().includes(q)) return true;
      if ((it.message || "").toLowerCase().includes(q)) return true;
      if ((it.type || "").toLowerCase().includes(q)) return true;
      return false;
    });
  }, [items, search, unreadOnly]);

  // actions
  const markRead = (id, val = true) => {
    setItems((prev) => {
      const next = prev.map((p) => (p.notificationId === id ? { ...p, read: !!val } : p));
      persist(next);
      return next;
    });
  };

  const remove = (id) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.notificationId !== id);
      persist(next);
      return next;
    });
    // close detail if open for same
    if (detail.open && detail.item && detail.item.notificationId === id) {
      setDetail({ open: false, item: null });
    }
  };

  const openDetail = (item) => {
    setDetail({ open: true, item });
    if (!item.read) markRead(item.notificationId, true);
  };
  const closeDetail = () => setDetail({ open: false, item: null });

  // small date formatting
  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso || "-";
    }
  };

  // UI render
  return (
    <>
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Live alerts from Orders, Inventory and Shipments.</p>
        </div>

        <div className="page-header-actions" style={{ gap: 8, display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              className="input-control"
              placeholder="Search id / email / message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 28, width: 340 }}
            />
            <FiSearch style={{ position: "absolute", left: 8, top: 9, color: "#9ca3af" }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>

            <button
              className="ghost-btn ghost-btn-sm"
              onClick={() => {
                setItems([]);
                persist([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="orders-card" style={{ padding: 0 }}>
        <div style={{ padding: 12, borderBottom: "1px solid rgba(148,163,184,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         
          <div style={{ fontSize: 13, color: "#6b7280" }}>Live via WebSocket</div>
        </div>

        <div style={{ maxHeight: "62vh", overflow: "auto" }}>
          <table className="orders-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ width: 56 }}></th>
                <th>Message</th>
                <th style={{ width: 200 }}>Recipient</th>
                <th style={{ width: 160 }}>Type</th>
                <th style={{ width: 180 }}>Timestamp</th>
                <th style={{ width: 120, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 20, color: "#94a3b8" }}>
                    No notifications yet.
                  </td>
                </tr>
              )}

              {filtered.map((it) => {
                const isNew = !!highlightRef.current[it.notificationId];
                return (
                  <tr
                    key={it.notificationId}
                    style={{
                      background: isNew ? "linear-gradient(90deg, rgba(99,102,241,0.06), transparent)" : undefined,
                      fontWeight: it.read ? 500 : 700,
                    }}
                  >
                    <td style={{ textAlign: "center", paddingTop: 14 }}>
                      <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {iconForType(it.type)}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ maxWidth: 760 }}>
                          <div style={{ marginBottom: 6 }}>{short(it.message, 160)}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{short(JSON.stringify(it.raw || {}, null, 2), 160)}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ verticalAlign: "top", paddingTop: 14 }}>{it.userEmail || "-"}</td>

                    <td style={{ verticalAlign: "top", paddingTop: 14 }}>
                      <span style={{ display: "inline-block", padding: "6px 10px", borderRadius: 9999, background: "#0f172a", color: "#c7d2fe", fontSize: 12 }}>
                        {it.type}
                      </span>
                    </td>

                    <td style={{ verticalAlign: "top", paddingTop: 14 }}>{fmt(it.timestamp)}</td>

                    <td style={{ textAlign: "right", verticalAlign: "top" }}>
                    
                      <button className="icon-btn icon-btn-danger" onClick={() => remove(it.notificationId)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detail.open && detail.item && (
        <div className="modal-backdrop" onClick={closeDetail}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Notification details</div>
                <div className="modal-subtitle">ID: {detail.item.notificationId} · {fmt(detail.item.timestamp)}</div>
              </div>

              <div style={{ marginLeft: 12 }}>
                <button className="ghost-btn ghost-btn-sm" onClick={() => markRead(detail.item.notificationId, !detail.item.read)}>
                  {detail.item.read ? "Mark unread" : "Mark read"}
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => {
                    remove(detail.item.notificationId);
                    closeDetail();
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Delete
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 12 }}>
              <div style={{ padding: 12, borderRight: "1px solid rgba(148,163,184,0.06)" }}>
                <div style={{ fontSize: 13, marginBottom: 8, color: "#94a3b8" }}>Summary</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{detail.item.type}</div>
                  <div style={{ fontSize: 13 }}>{detail.item.userEmail || "-"}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{fmt(detail.item.timestamp)}</div>
                </div>

                <div style={{ fontSize: 13, marginTop: 12, color: "#94a3b8" }}>Extracted fields</div>
                <pre style={{ fontSize: 12, background: "#020617", color: "#e5e7eb", padding: 8, borderRadius: 6, overflow: "auto" }}>
                  {JSON.stringify(
                    {
                      id: detail.item.notificationId,
                      type: detail.item.type,
                      recipient: detail.item.userEmail,
                      timestamp: detail.item.timestamp,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, marginBottom: 8, color: "#94a3b8" }}>Message</div>
                <div style={{ marginBottom: 12 }}>{detail.item.message}</div>

                <div style={{ fontSize: 13, marginBottom: 8, color: "#94a3b8" }}>Raw payload</div>
                <pre style={{ fontSize: 12, background: "#020617", color: "#e5e7eb", padding: 12, borderRadius: 6, overflow: "auto", maxHeight: "48vh" }}>
                  {JSON.stringify(detail.item.raw, null, 2)}
                </pre>
              </div>
            </div>

            <div className="modal-footer">
              <button className="ghost-btn" onClick={closeDetail}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsPage;
