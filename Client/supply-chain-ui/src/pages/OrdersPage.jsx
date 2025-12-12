import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiRefreshCcw,
  FiTrash2,
  FiChevronDown,
} from "react-icons/fi";

const API_BASE = "http://localhost:8080/api";

const STATUS_OPTIONS = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ sku: "", quantity: 1, unitPrice: 0 }]);
  const [formError, setFormError] = useState("");

  // Result modal (success / error)
  const [resultModal, setResultModal] = useState({
    open: false,
    type: "success", // "success" | "error"
    title: "",
    message: "",
  });

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.content || [];
      setOrders(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while loading orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const resetForm = () => {
    setCustomerId("");
    setItems([{ sku: "", quantity: 1, unitPrice: 0 }]);
    setFormError("");
  };

  const openCreateModal = () => {
    setMode("create");
    setEditingId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { sku: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanedItems = items
      .filter((it) => it.sku.trim() !== "")
      .map((it) => ({
        ...it,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
      }));

    if (!customerId.trim()) {
      setFormError("Customer ID is required.");
      return;
    }

    if (cleanedItems.length === 0) {
      setFormError("Please add at least one item with a SKU.");
      return;
    }

    const payload = {
      customerId: customerId.trim(),
      items: cleanedItems,
    };

    setLoadingAction(true);
    try {
      let res;
      if (mode === "create") {
        // POST /api/orders
        res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // EDIT: your choice -> currently hitting /status endpoint
        res = await fetch(`${API_BASE}/orders/${editingId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      closeModal();
      await fetchOrders();
      setResultModal({
        open: true,
        type: "success",
        title: mode === "create" ? "Order created" : "Order updated",
        message:
          mode === "create"
            ? "The order was created successfully and events were dispatched."
            : "The order was updated successfully.",
      });
    } catch (err) {
      setFormError("Failed to save order.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete order");
      }
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setResultModal({
        open: true,
        type: "success",
        title: "Order deleted",
        message: `Order #${orderId} was deleted successfully.`,
      });
    } catch (err) {
      console.error(err);
      setResultModal({
        open: true,
        type: "error",
        title: "Delete failed",
        message: err.message || "Failed to delete order.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update status");
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      setResultModal({
        open: true,
        type: "error",
        title: "Status update failed",
        message: "Failed to update order status.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const computeOrderTotal = (order) => {
    if (order.totalAmount != null) return order.totalAmount;
    if (Array.isArray(order.items)) {
      return order.items.reduce(
        (sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0),
        0
      );
    }
    return 0;
  };

  const formatDate = (val) => {
    if (!val) return "-";
    try {
      return new Date(val).toLocaleString();
    } catch {
      return String(val);
    }
  };

  const totalOrders = orders.length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;

  const closeResultModal = () =>
    setResultModal((prev) => ({ ...prev, open: false }));

  return (
    <>
      {/* Page header: title on left, buttons on right */}
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title" style={{position: "relative", marginTop:"0"}}>Orders</h1>
          <p className="page-subtitle">
            Create and manage customer orders in one place.
          </p>
        </div>

        <div className="page-header-actions">
          
          <button
            className="primary-btn primary-btn-sm"
            type="button"
            onClick={openCreateModal}
          >
            <FiPlus className="primary-btn-icon" size={16} />
            <span>New Order</span>
          </button>
          <button
            className="ghost-btn ghost-btn-xl"
            type="button"
            onClick={fetchOrders}
            disabled={loading}
          >
            <FiRefreshCcw size={16} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Content card */}
      <div className="orders-card">
        <div
          className="orders-toolbar"
          style={{ justifyContent: "flex-end" }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%"
          }}>
            <div className="orders-toolbar-title">Order list</div>
            <div className="orders-toolbar-subtitle">
              {totalOrders} total · {confirmedCount} confirmed
            </div>
          </div>
        </div>

        {error && <div className="orders-error">{error}</div>}

        <div className="orders-table-wrapper">
          {loading ? (
            <div className="orders-loading">
              <div className="spinner" />
              <span>Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
                <div className="orders-empty-title">No orders yet</div>
              <button
                className="primary-btn"
                type="button"
                  onClick={openCreateModal}
                  style={{marginTop: "10px"}}
              >
                <FiPlus className="primary-btn-icon" />
                <span>Create order</span>
              </button>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th style={{ width: 160 }}>Customer</th>
                  <th style={{ width: 140 }}>Status</th>
                  <th style={{ width: 120 }}>Items</th>
                  <th style={{ width: 140 }}>Total</th>
                  <th>Created</th>
                  <th style={{ width: 90, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const total = computeOrderTotal(order);
                  const itemsCount = Array.isArray(order.items)
                    ? order.items.length
                    : 0;

                  const uniqueStatuses = Array.from(
                    new Set(
                      [...STATUS_OPTIONS, order.status].filter(Boolean)
                    )
                  );

                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customerId || "-"}</td>
                      <td>
                        <div className="status-select-wrapper">
                          <select
                            className="status-select"
                            value={order.status || "CREATED"}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                          >
                            {uniqueStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <FiChevronDown className="status-select-icon" />
                        </div>
                      </td>
                      <td>{itemsCount} item(s)</td>
                      <td>₹ {total.toLocaleString()}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="orders-row-actions">
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            title="Delete"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={loadingAction}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Order Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  {mode === "create" ? "New Order" : `Edit Order #${editingId}`}
                </div>
          
              </div>
            </div>

            <form onSubmit={handleSubmitOrder}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Customer ID</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. CUST-7"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Item ID, Quantity &amp; Unit Price
                  </label>
                  <div className="items-container">
                    {items.map((item, index) => (
                      <div key={index} className="item-row">
                        <input
                          type="text"
                          className="input-control item-input"
                          placeholder="Item ID / SKU (e.g. SKU-102)"
                          value={item.sku}
                          onChange={(e) =>
                            handleItemChange(index, "sku", e.target.value)
                          }
                        />
                        <input
                          type="number"
                          className="input-control item-input"
                          placeholder="Qty"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                        />
                        <input
                          type="number"
                          className="input-control item-input"
                          placeholder="Unit price"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unitPrice",
                              e.target.value
                            )
                          }
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            className="item-remove-btn"
                            onClick={() => removeItemRow(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="ghost-btn ghost-btn-sm"
                      onClick={addItemRow}
                    >
                      <FiPlus size={13} />
                      <span>Add another item</span>
                    </button>
                  </div>
                </div>

                {formError && <div className="form-error">{formError}</div>}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loadingAction}
                >
                  {loadingAction
                    ? mode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : mode === "create"
                    ? "Confirm & create order"
                    : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal (success / error) */}
      {resultModal.open && (
        <div className="result-modal-backdrop" onClick={closeResultModal}>
          <div
            className="result-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={
                "result-modal-title " +
                (resultModal.type === "success"
                  ? "result-modal-title-success"
                  : "result-modal-title-error")
              }
            >
              {resultModal.title}
            </div>
            <div className="result-modal-message">
              {resultModal.message}
            </div>
            <div className="result-modal-footer">
              <button
                type="button"
                className="primary-btn primary-btn-sm"
                onClick={closeResultModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
