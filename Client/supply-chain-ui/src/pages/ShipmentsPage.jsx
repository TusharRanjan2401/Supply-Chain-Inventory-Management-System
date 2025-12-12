import React, { useEffect, useState } from "react";
import { FiPlus, FiRefreshCcw, FiTrash2, FiEdit2, FiChevronDown } from "react-icons/fi";

const API_BASE = "http://localhost:8080/api"; // API Gateway for general calls (listing, create, delete, status)
const SHIPMENT_LOCATION_BASE = API_BASE;
const STATUS_OPTIONS = [
  "CREATED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
];

export const ShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);

  // modal / form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit-location"
  const [editingId, setEditingId] = useState(null);

  const [orderId, setOrderId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState(""); // ISO-local for datetime-local input
  const [formError, setFormError] = useState("");

  // location-edit specific
  const [currentLocation, setCurrentLocation] = useState("");

  // result modal
  const [resultModal, setResultModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // fetch list
  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/shipment`);
      if (!res.ok) throw new Error("Failed to fetch shipments");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.content || [];
      setShipments(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while loading shipments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const resetForm = () => {
    setOrderId("");
    setTrackingNumber("");
    setOrigin("");
    setDestination("");
    setEstimatedDelivery("");
    setFormError("");
    setCurrentLocation("");
    setEditingId(null);
  };

  const openCreateModal = () => {
    setMode("create");
    resetForm();
    setIsModalOpen(true);
  };

  // NEW: open edit-location modal only
  const openEditLocationModal = (s) => {
    setMode("edit-location");
    setEditingId(s.id);
    setCurrentLocation(s.currentLocation ?? "");
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const closeResultModal = () => setResultModal(prev => ({ ...prev, open: false }));

  const validateShipmentForm = () => {
    if (!orderId.toString().trim()) return "Order ID is required.";
    if (!trackingNumber.trim()) return "Tracking number is required.";
    if (!origin.trim()) return "Origin is required.";
    if (!destination.trim()) return "Destination is required.";
    return null;
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setFormError("");

    // create flow (unchanged)
    if (mode === "create") {
      const err = validateShipmentForm();
      if (err) {
        setFormError(err);
        return;
      }

      const payload = {
        orderId: Number(orderId) || orderId,
        trackingNumber: trackingNumber.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
      };

      setLoadingAction(true);
      try {
        const res = await fetch(`${API_BASE}/shipment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Request failed");
        }
        closeModal();
        await fetchShipments();
        setResultModal({
          open: true,
          type: "success",
          title: "Shipment created",
          message: "Shipment created and events sent.",
        });
      } catch (err) {
        console.error(err);
        setFormError(err.message || "Failed to save shipment.");
      } finally {
        setLoadingAction(false);
      }
      return;
    }

    // edit-location flow
    if (mode === "edit-location") {
      if (!editingId) {
        setFormError("No shipment selected to update.");
        return;
      }
      if (!currentLocation.trim()) {
        setFormError("Current location cannot be empty.");
        return;
      }

      setLoadingAction(true);
      try {
        const res = await fetch(`${SHIPMENT_LOCATION_BASE}/shipment/${editingId}/location`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentLocation: currentLocation.trim() }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to update location");
        }

        closeModal();
        await fetchShipments();
        setResultModal({
          open: true,
          type: "success",
          title: "Location updated",
          message: `Shipment #${editingId} location updated.`,
        });
      } catch (err) {
        console.error(err);
        setFormError(err.message || "Failed to update location.");
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/shipment/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update status");
      }
      setShipments(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      console.error(err);
      setResultModal({
        open: true,
        type: "error",
        title: "Status update failed",
        message: err.message || "Failed to update shipment status.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/shipment/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to delete shipment");
      }
      setShipments(prev => prev.filter(s => s.id !== id));
      setResultModal({
        open: true,
        type: "success",
        title: "Shipment deleted",
        message: `Shipment #${id} deleted.`,
      });
    } catch (err) {
      console.error(err);
      setResultModal({
        open: true,
        type: "error",
        title: "Delete failed",
        message: err.message || "Failed to delete shipment.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const computeETA = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">Shipments</h1>
          <p className="page-subtitle">Track and manage shipment movement across your supply chain.</p>
        </div>

        <div className="page-header-actions">
          <button className="ghost-btn ghost-btn-sm" type="button" onClick={fetchShipments} disabled={loading}>
            <FiRefreshCcw size={13} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button className="primary-btn primary-btn-sm" type="button" onClick={openCreateModal}>
            <FiPlus className="primary-btn-icon" size={13} />
            <span>New Shipment</span>
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="orders-card">
        <div className="orders-toolbar" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="orders-toolbar-title">Shipment registry</div>
            <div className="orders-toolbar-subtitle">
              {shipments.length} shipments · {shipments.filter(s => s.status === "DELIVERED").length} delivered
            </div>
          </div>
        </div>

        {error && <div className="orders-error">{error}</div>}

        <div className="orders-table-wrapper">
          {loading ? (
            <div className="orders-loading"><div className="spinner" /> <span>Loading shipments...</span></div>
          ) : shipments.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty-title">No shipments</div>
              <div className="orders-empty-subtitle">Create a shipment to start tracking delivery progress.</div>
              <button className="primary-btn" type="button" onClick={openCreateModal}><FiPlus className="primary-btn-icon" />Create shipment</button>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>Order</th>
                  <th>Tracking</th>
                  <th>Route</th>
                  <th style={{ width: 140 }}>ETA</th>
                  <th style={{ width: 140 }}>Status</th>
                  <th style={{ width: 140 }}>Current location</th>
                  <th style={{ width: 90, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>{s.orderId ?? "-"}</td>
                    <td>{s.trackingNumber ?? "-"}</td>
                    <td>{(s.origin ?? "-")} → {(s.destination ?? "-")}</td>
                    <td>{computeETA(s.estimatedDelivery)}</td>
                    <td>
                      <div className="status-select-wrapper">
                        <select className="status-select" value={s.status ?? "CREATED"} onChange={(e) => handleStatusChange(s.id, e.target.value)}>
                          {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                        <FiChevronDown className="status-select-icon" />
                      </div>
                    </td>
                    <td>{s.currentLocation ?? "-"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="orders-row-actions">
                        <button className="icon-btn" title="Update location" onClick={() => openEditLocationModal(s)}><FiEdit2 size={14} /></button>
                        <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => handleDelete(s.id)} disabled={loadingAction}><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create modal (unchanged) */}
      {isModalOpen && mode === "create" && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">New Shipment</div>
                <div className="modal-subtitle">This will call <code>POST /api/shipment</code> via API Gateway.</div>
              </div>
            </div>

            <form onSubmit={handleCreateOrUpdate}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Order ID</label>
                  <input className="input-control" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. 4" />
                </div>

                <div className="input-group">
                  <label className="input-label">Tracking Number</label>
                  <input className="input-control" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="TRK-087" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div className="input-group">
                    <label className="input-label">Origin</label>
                    <input className="input-control" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Pune Warehouse" />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Destination</label>
                    <input className="input-control" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Bokaro Hub" />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Estimated Delivery (local date/time)</label>
                  <input type="datetime-local" className="input-control" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} />
                </div>

                {formError && <div className="form-error">{formError}</div>}
              </div>

              <div className="modal-footer">
                <button type="button" className="ghost-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loadingAction}>{loadingAction ? "Creating..." : "Create shipment"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT-LOCATION modal */}
      {isModalOpen && mode === "edit-location" && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{`Update location for #${editingId}`}</div>
                <div className="modal-subtitle">This will call <code>PATCH {SHIPMENT_LOCATION_BASE}/shipment/{editingId}/location</code></div>
              </div>
            </div>

            <form onSubmit={handleCreateOrUpdate}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Current Location</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Near Pune"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                  />
                </div>

                {formError && <div className="form-error">{formError}</div>}
              </div>

              <div className="modal-footer">
                <button type="button" className="ghost-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loadingAction}>{loadingAction ? "Saving..." : "Save location"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result modal */}
      {resultModal.open && (
        <div className="result-modal-backdrop" onClick={closeResultModal}>
          <div className="result-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className={`result-modal-title ${resultModal.type === "success" ? "result-modal-title-success" : "result-modal-title-error"}`}>{resultModal.title}</div>
            <div className="result-modal-message">{resultModal.message}</div>
            <div className="result-modal-footer">
              <button className="primary-btn primary-btn-sm" onClick={closeResultModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
