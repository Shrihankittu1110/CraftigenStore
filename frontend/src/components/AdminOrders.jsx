import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";
import { getAuthHeaders } from "../auth";
import BackButton from "./BackButton";

const formatPrice = (value) => Number(value || 0).toLocaleString("en-IN");
const formatDate = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/order/getall`, { headers: getAuthHeaders() });
        if (res.ok) setOrders(await res.json());
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    return [
      { label: "New orders", value: orders.filter((order) => order.orderStatus === "Placed").length, tone: "bg-amber-50 text-amber-900" },
      { label: "Processing", value: orders.filter((order) => order.orderStatus === "Processing").length, tone: "bg-sky-50 text-sky-900" },
      { label: "Delivered", value: orders.filter((order) => order.orderStatus === "Delivered").length, tone: "bg-emerald-50 text-emerald-900" },
      { label: "Revenue", value: `Rs ${formatPrice(totalRevenue)}`, tone: "bg-stone-100 text-stone-900" },
    ];
  }, [orders]);

  return (
    <main className="page-shell">
      <section className="section-wrap py-12">
        <BackButton fallback="/profile" />
        <div className="surface p-6 sm:p-8">
          <p className="section-kicker">Admin</p>
          <h1 className="section-title mt-2">Orders</h1>
          <p className="section-copy mt-3">
            Review real customer orders, payment status, fulfilment progress, and delivery updates.
          </p>
        </div>
      </section>

      <section className="section-wrap pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${stat.tone}`}>{stat.label}</p>
              <p className="mt-4 text-3xl font-black text-stone-950">{stat.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-10 text-center font-bold text-stone-600 shadow-sm">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-900">
              <i className="fa-solid fa-receipt text-2xl" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-stone-950">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-600">
              Customer orders will appear here after users complete checkout.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-stone-950 text-white">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="transition hover:bg-emerald-50/70">
                      <td className="px-5 py-4">
                        <p className="font-black text-stone-950">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="mt-1 text-xs font-bold text-stone-500">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-stone-900">{order.customer?.name}</p>
                        <p className="mt-1 text-xs text-stone-500">{order.customer?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-stone-700">{order.items.length} item(s)</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">{order.paymentStatus}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900">{order.orderStatus}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-black text-stone-950">Rs {formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminOrders;
