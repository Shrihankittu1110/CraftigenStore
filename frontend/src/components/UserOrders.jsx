import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../config";
import { getAuthHeaders } from "../auth";
import BackButton from "./BackButton";

const formatPrice = (value) => Number(value || 0).toLocaleString("en-IN");
const formatDate = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/order/mine`, { headers: getAuthHeaders() });
        if (res.ok) setOrders(await res.json());
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancel order?",
      text: "This order will be marked as cancelled.",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
    });

    if (!result.isConfirmed) return;

    setCancellingOrderId(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/order/cancel/${orderId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to cancel order");

      setOrders((currentOrders) => currentOrders.map((order) => (order._id === orderId ? data : order)));
      Swal.fire({ icon: "success", title: "Order cancelled", timer: 1200, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Cancel failed", text: error.message });
    } finally {
      setCancellingOrderId("");
    }
  };

  const orderCountText = useMemo(() => `${orders.length} ${orders.length === 1 ? "order" : "orders"}`, [orders.length]);

  return (
    <main className="page-shell">
      <section className="section-wrap py-12">
        <BackButton fallback="/profile" />
        <div className="mb-8">
          <p className="section-kicker">Account</p>
          <h1 className="section-title mt-2">Your Orders</h1>
          <p className="section-copy mt-3">Review your placed orders, payment status, and delivery progress.</p>
        </div>

        {loading ? (
          <div className="surface p-8 text-center font-bold text-stone-600">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="surface p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-900">
              <i className="fa-solid fa-receipt text-2xl" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-stone-950">No orders yet</h2>
            <p className="mt-2 text-stone-600">Your completed Craftigen orders will appear here.</p>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm font-bold text-stone-600">Showing {orderCountText}</p>
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order._id} className="surface p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-800">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <h2 className="mt-2 text-xl font-black text-stone-950">{formatDate(order.createdAt)}</h2>
                      <p className="mt-1 text-sm text-stone-600">{order.items.length} item(s) - Rs {formatPrice(order.total)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">{order.paymentStatus}</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900">{order.tracking?.status || order.orderStatus}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {order.items.map((item) => (
                      <div key={`${order._id}-${item.name}`} className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 text-sm">
                        <span className="font-bold text-stone-800">{item.name} x {item.quantity}</span>
                        <span className="font-black text-stone-950">Rs {formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                      onClick={() => cancelOrder(order._id)}
                      disabled={order.orderStatus === "Cancelled" || cancellingOrderId === order._id}
                    >
                      {cancellingOrderId === order._id ? "Cancelling..." : order.orderStatus === "Cancelled" ? "Cancelled" : "Cancel Order"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default UserOrders;
