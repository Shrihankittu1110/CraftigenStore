import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../config";
import { getAuthHeaders } from "../auth";
import AdminLoadingPopup from "./AdminLoadingPopup";
import BackButton from "./BackButton";

const trackingSteps = [
  { label: "Order received", icon: "fa-receipt" },
  { label: "Payment confirmed", icon: "fa-credit-card" },
  { label: "Packed by store", icon: "fa-box" },
  { label: "Handed to courier", icon: "fa-truck-ramp-box" },
  { label: "Out for delivery", icon: "fa-route" },
  { label: "Delivered", icon: "fa-circle-check" },
];

const orderStatuses = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
const formatPrice = (value) => Number(value || 0).toLocaleString("en-IN");

const getStageIndex = (status) => {
  const index = trackingSteps.findIndex((step) => step.label === status);
  return index === -1 ? 0 : index;
};

const AdminTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/order/getall`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setSelectedOrderId((current) => current || data[0]?._id || "");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order._id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  const stats = useMemo(() => [
    { label: "Orders ready to track", value: orders.length, icon: "fa-clipboard-list", tone: "bg-emerald-50 text-emerald-900" },
    { label: "Awaiting dispatch", value: orders.filter((order) => ["Order received", "Payment confirmed", "Packed by store"].includes(order.tracking?.status)).length, icon: "fa-box-open", tone: "bg-amber-50 text-amber-900" },
    { label: "In transit", value: orders.filter((order) => ["Handed to courier", "Out for delivery"].includes(order.tracking?.status)).length, icon: "fa-truck-fast", tone: "bg-sky-50 text-sky-900" },
    { label: "Delivery issues", value: orders.filter((order) => order.orderStatus === "Cancelled").length, icon: "fa-triangle-exclamation", tone: "bg-rose-50 text-rose-900" },
  ], [orders]);

  const updateTracking = async (event) => {
    event.preventDefault();
    if (!selectedOrder || saving) return;

    const formData = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/order/tracking/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          trackingStatus: formData.get("trackingStatus"),
          orderStatus: formData.get("orderStatus"),
          paymentStatus: formData.get("paymentStatus"),
          courier: formData.get("courier"),
          trackingId: formData.get("trackingId"),
          estimatedDelivery: formData.get("estimatedDelivery"),
          note: formData.get("note"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        Swal.fire({ icon: "error", title: "Update failed", text: data.message || "Please try again." });
        return;
      }

      const updatedOrder = await res.json();
      setOrders((current) => current.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)));
      Swal.fire({ icon: "success", title: "Tracking updated", timer: 1200, showConfirmButton: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-shell">
      {loading && (
        <AdminLoadingPopup
          title="Loading tracking"
          message="Fetching shipment records and delivery progress."
        />
      )}

      <section className="section-wrap py-10">
        <BackButton fallback="/profile" />
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-stretch">
          <div className="surface p-6 sm:p-8">
            <p className="section-kicker">Admin</p>
            <h1 className="section-title mt-2">Delivery Tracking</h1>
            <p className="section-copy mt-3 max-w-3xl">
              Track customer orders, courier details, delivery stages, and payment status from real checkout records.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Tracking Status</p>
            <div className="mt-5 flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-900">
                <i className="fa-solid fa-inbox text-xl" />
              </span>
              <div>
                <p className="text-3xl font-black text-stone-950">{orders.length}</p>
                <p className="text-sm font-bold text-stone-600">Live tracking records</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap pb-16">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className={`grid h-11 w-11 place-items-center rounded-full ${stat.tone}`}>
                  <i className={`fa-solid ${stat.icon}`} />
                </span>
                <p className="text-3xl font-black text-stone-950">{stat.value}</p>
              </div>
              <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-stone-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {!loading && !orders.length ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-900">
              <i className="fa-solid fa-truck-fast text-2xl" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-stone-950">No orders to track</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-600">
              The tracking queue is empty because no customer orders have been placed yet.
            </p>
          </div>
        ) : !loading ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 p-5">
                <h2 className="text-xl font-black text-stone-950">Shipment Queue</h2>
                <p className="mt-1 text-sm text-stone-600">Select an order to update courier and delivery progress.</p>
              </div>
              <div className="divide-y divide-stone-200">
                {orders.map((order) => (
                  <button
                    key={order._id}
                    className={`grid w-full gap-3 p-5 text-left transition hover:bg-emerald-50/70 ${selectedOrder?._id === order._id ? "bg-emerald-50" : ""}`}
                    onClick={() => setSelectedOrderId(order._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-stone-950">#{order._id.slice(-6).toUpperCase()} - {order.customer?.name}</p>
                        <p className="mt-1 text-sm text-stone-600">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900">{order.tracking?.status}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-emerald-900" style={{ width: `${((getStageIndex(order.tracking?.status) + 1) / trackingSteps.length) * 100}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">Selected Order</p>
              <h2 className="mt-2 text-2xl font-black text-stone-950">#{selectedOrder._id.slice(-6).toUpperCase()}</h2>
              <p className="mt-1 text-sm text-stone-600">{selectedOrder.customer?.name} - Rs {formatPrice(selectedOrder.total)}</p>

              <div className="mt-6 space-y-4">
                {trackingSteps.map((step, index) => {
                  const currentStage = getStageIndex(selectedOrder.tracking?.status);
                  const isComplete = index <= currentStage;
                  const isCurrent = index === currentStage;

                  return (
                    <div key={step.label} className="flex gap-3">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${isComplete ? "bg-emerald-900 text-white" : "bg-stone-100 text-stone-400"}`}>
                        <i className={`fa-solid ${step.icon}`} />
                      </span>
                      <div className="min-w-0 pb-3">
                        <p className={`font-black ${isComplete ? "text-stone-950" : "text-stone-500"}`}>{step.label}</p>
                        <p className="mt-1 text-xs font-bold text-stone-500">{isCurrent ? "Current stage" : isComplete ? "Completed" : "Pending"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className="mt-6 grid gap-4" onSubmit={updateTracking}>
                <div>
                  <label className="field-label">Tracking status</label>
                  <select className="field" name="trackingStatus" defaultValue={selectedOrder.tracking?.status} key={`${selectedOrder._id}-tracking`}>
                    {trackingSteps.map((step) => <option key={step.label}>{step.label}</option>)}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Order status</label>
                    <select className="field" name="orderStatus" defaultValue={selectedOrder.orderStatus} key={`${selectedOrder._id}-order`}>
                      {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Payment status</label>
                    <select className="field" name="paymentStatus" defaultValue={selectedOrder.paymentStatus} key={`${selectedOrder._id}-payment`}>
                      {paymentStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Courier</label>
                    <input className="field" name="courier" defaultValue={selectedOrder.tracking?.courier} key={`${selectedOrder._id}-courier`} />
                  </div>
                  <div>
                    <label className="field-label">Tracking ID</label>
                    <input className="field" name="trackingId" defaultValue={selectedOrder.tracking?.trackingId} key={`${selectedOrder._id}-trackingId`} />
                  </div>
                </div>
                <div>
                  <label className="field-label">Estimated delivery</label>
                  <input className="field" name="estimatedDelivery" defaultValue={selectedOrder.tracking?.estimatedDelivery} key={`${selectedOrder._id}-eta`} />
                </div>
                <div>
                  <label className="field-label">Admin note</label>
                  <textarea className="field min-h-24 resize-y" name="note" defaultValue={selectedOrder.tracking?.note} key={`${selectedOrder._id}-note`} />
                </div>
                <button className="btn-primary w-full" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Tracking"}
                </button>
              </form>
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default AdminTracking;
