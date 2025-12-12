import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiRefreshCcw, FiTrash2, FiEdit2 } from "react-icons/fi";

const API_BASE = "http://localhost:8080/api"; // gateway (listing/creating/deleting)
const INVENTORY_API_BASE = "http://localhost:8080/api"; // inventory service for threshold/adjustStock

export const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);

  // modal/form state (create not changed; edit modal for threshold & delta)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);

  // create form fields (kept for create flow)
  const [sku, setSku] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [availableQty, setAvailableQty] = useState(0);
  const [reservedQty, setReservedQty] = useState(0);
  const [incomingQty, setIncomingQty] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [formError, setFormError] = useState("");

  // edit-specific fields (threshold and delta)
  const [editThreshold, setEditThreshold] = useState(0);
  const [adjustDelta, setAdjustDelta] = useState(0);

  // result modal
  const [resultModal, setResultModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/inventory`);
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.content || [];
      setItems(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Create modal helpers (unchanged)
  const openCreateModal = () => {
    setMode("create");
    setEditingId(null);
    resetForm();
    setIsModalOpen(true);
  };

  // NEW: open edit modal (threshold + delta only)
  const openEditModal = (it) => {
    setMode("edit");
    setEditingId(it.id);
    // prefilling only threshold; delta default 0
    setEditThreshold(it.threshold ?? 0);
    setAdjustDelta(0);
    setFormError("");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSku("");
    setWarehouseId("");
    setAvailableQty(0);
    setReservedQty(0);
    setIncomingQty(0);
    setThreshold(0);
    setFormError("");
    setEditThreshold(0);
    setAdjustDelta(0);
  };

  const closeModal = () => setIsModalOpen(false);
  const closeResultModal = () =>
    setResultModal((prev) => ({ ...prev, open: false }));

  const validateCreateForm = () => {
    if (!sku.trim()) return "SKU / Item ID is required.";
    if (!warehouseId.trim()) return "Warehouse ID is required.";
    return null;
  };

  // create / update handlers (create kept)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (mode === "create") {
      const err = validateCreateForm();
      if (err) {
        setFormError(err);
        return;
      }

      const payload = {
        sku: sku.trim(),
        warehouseId: warehouseId.trim(),
        availableQty: Number(availableQty) || 0,
        reservedQty: Number(reservedQty) || 0,
        incomingQty: Number(incomingQty) || 0,
        threshold: Number(threshold) || 0,
      };

      setLoadingAction(true);
      try {
        const res = await fetch(`${API_BASE}/inventory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Request failed");
        }
        closeModal();
        await fetchItems();
        setResultModal({
          open: true,
          type: "success",
          title: "Item added",
          message: "Inventory item added successfully.",
        });
      } catch (err) {
        console.error(err);
        setFormError(err.message || "Failed to save inventory item");
      } finally {
        setLoadingAction(false);
      }
    } else {
      // EDIT mode — we only call threshold and adjustStock endpoints here
      setFormError("");
      setLoadingAction(true);
      try {
        let thresholdUpdated = false;
        let adjustUpdated = false;
        const messages = [];

        // 1) If threshold changed, call PUT /inventory/:id/threshold
        // User said the body is int threshold (like 25) — we send a JSON number.
        if (typeof editThreshold === "number") {
          // Fetch the existing threshold from items list to compare
          const existing = items.find((it) => it.id === editingId);
          const existingThreshold = existing ? (existing.threshold ?? 0) : null;
          if (existingThreshold !== null && Number(editThreshold) !== Number(existingThreshold)) {
            const resThreshold = await fetch(
              `${INVENTORY_API_BASE}/inventory/${editingId}/threshold`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Number(editThreshold)),
              }
            );
            if (!resThreshold.ok) {
              const txt = await resThreshold.text();
              throw new Error(
                `Threshold update failed: ${txt || resThreshold.statusText}`
              );
            }
            thresholdUpdated = true;
            messages.push(`Threshold updated to ${editThreshold}`);
          }
        }

        // 2) If delta non-zero, call PATCH /inventory/:id/adjustStock
        if (Number(adjustDelta) !== 0) {
          const resAdjust = await fetch(
            `${INVENTORY_API_BASE}/inventory/${editingId}/adjustStock`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ delta: Number(adjustDelta) }),
            }
          );
          if (!resAdjust.ok) {
            const txt = await resAdjust.text();
            throw new Error(`Adjust stock failed: ${txt || resAdjust.statusText}`);
          }
          adjustUpdated = true;
          messages.push(
            `Stock adjusted by ${adjustDelta > 0 ? "+" : ""}${adjustDelta}`
          );
        }

        if (!thresholdUpdated && !adjustUpdated) {
          // nothing changed
          setFormError("No changes to apply (threshold unchanged and delta is 0).");
          setLoadingAction(false);
          return;
        }

        // success
        closeModal();
        await fetchItems();
        setResultModal({
          open: true,
          type: "success",
          title: "Update successful",
          message: messages.join(" · "),
        });
      } catch (err) {
        console.error(err);
        setResultModal({
          open: true,
          type: "error",
          title: "Update failed",
          message: err.message || "Failed to update inventory item.",
        });
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleDelete = async (id) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Delete failed");
      }
      await fetchItems();
      setResultModal({
        open: true,
        type: "success",
        title: "Deleted",
        message: "Inventory item deleted successfully.",
      });
    } catch (err) {
      console.error(err);
      setResultModal({
        open: true,
        type: "error",
        title: "Delete failed",
        message: err.message || "Failed to delete item.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        String(it.sku || "").toLowerCase().includes(q) ||
        String(it.warehouseId || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage stock per SKU and warehouse.</p>
        </div>

        <div className="page-header-actions">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="search"
              placeholder="Search SKU or warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-control"
              style={{ width: 220 }}
            />
            <button
              className="ghost-btn ghost-btn-sm"
              onClick={fetchItems}
              disabled={loading}
            >
              <FiRefreshCcw size={13} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              className="primary-btn primary-btn-sm"
              onClick={openCreateModal}
            >
              <FiPlus className="primary-btn-icon" />
              <span>New Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="orders-card">
        <div className="orders-toolbar" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="orders-toolbar-title">Stock register</div>
            <div className="orders-toolbar-subtitle">
              {items.length} items · {items.filter((i) => i.availableQty <= (i.threshold ?? 0)).length} low-stock
            </div>
          </div>
        </div>

        {error && <div className="orders-error">{error}</div>}

        <div className="orders-table-wrapper">
          {loading ? (
            <div className="orders-loading">
              <div className="spinner" />
              <span>Loading inventory...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty-title">No inventory items</div>
              <div className="orders-empty-subtitle">
                Add stock items using <strong>New Item</strong>.
              </div>
              <button className="primary-btn" onClick={openCreateModal}>
                <FiPlus className="primary-btn-icon" />
                <span>Create item</span>
              </button>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>SKU</th>
                  <th style={{ width: 120 }}>Warehouse</th>
                  <th style={{ width: 110 }}>Available</th>
                  <th style={{ width: 110 }}>Reserved</th>
                  <th style={{ width: 110 }}>Incoming</th>
                  <th style={{ width: 100 }}>Threshold</th>
                  <th style={{ width: 90, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr key={it.id} className={it.availableQty <= (it.threshold ?? 0) ? "low-stock" : ""}>
                    <td>#{it.id}</td>
                    <td>{it.sku}</td>
                    <td>{it.warehouseId}</td>
                    <td>{it.availableQty ?? 0}</td>
                    <td>{it.reservedQty ?? 0}</td>
                    <td>{it.incomingQty ?? 0}</td>
                    <td>{it.threshold ?? 0}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="orders-row-actions">
                        <button className="icon-btn" title="Edit threshold / adjust stock" onClick={() => openEditModal(it)}>
                          <FiEdit2 size={14} />
                        </button>
                        <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => handleDelete(it.id)} disabled={loadingAction}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create modal (kept same) */}
      {isModalOpen && mode === "create" && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">New inventory item</div>
                <div className="modal-subtitle">Adds a new SKU + warehouse record (POST /api/inventory)</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">SKU / Item ID</label>
                  <input className="input-control" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>

                <div className="input-group">
                  <label className="input-label">Warehouse ID</label>
                  <input className="input-control" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div className="input-group">
                    <label className="input-label">Available qty</label>
                    <input type="number" className="input-control" value={availableQty} onChange={(e) => setAvailableQty(e.target.value)} />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Reserved qty</label>
                    <input type="number" className="input-control" value={reservedQty} onChange={(e) => setReservedQty(e.target.value)} />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Incoming qty</label>
                    <input type="number" className="input-control" value={incomingQty} onChange={(e) => setIncomingQty(e.target.value)} />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Threshold</label>
                    <input type="number" className="input-control" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
                  </div>
                </div>

                {formError && <div className="form-error">{formError}</div>}
              </div>

              <div className="modal-footer">
                <button type="button" className="ghost-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loadingAction}>
                  {loadingAction ? "Creating..." : "Create item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT modal: threshold + adjust delta only */}
      {isModalOpen && mode === "edit" && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{`Edit Item #${editingId}`}</div>
                <div className="modal-subtitle">Update threshold or adjust stock (PATCH /adjustStock, PUT /threshold)</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Threshold</label>
                  <input
                    type="number"
                    className="input-control"
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(Number(e.target.value))}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Adjust stock (delta)</label>
                  <input
                    type="number"
                    className="input-control"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(Number(e.target.value))}
                    placeholder="e.g. -5 or 10"
                  />
                  <div style={{ marginTop: 6, fontSize: 12, color: "#9ca3af" }}>
                    Enter a positive number to increase stock, negative to decrease. Leave 0 if no change.
                  </div>
                </div>

                {formError && <div className="form-error">{formError}</div>}
              </div>

              <div className="modal-footer">
                <button type="button" className="ghost-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loadingAction}>
                  {loadingAction ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result modal */}
      {resultModal.open && (
        <div className="result-modal-backdrop" onClick={closeResultModal}>
          <div className="result-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className={`result-modal-title ${resultModal.type === "success" ? "result-modal-title-success" : "result-modal-title-error"}`}>
              {resultModal.title}
            </div>
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
