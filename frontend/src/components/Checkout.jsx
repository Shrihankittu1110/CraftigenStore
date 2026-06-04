import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../config";
import { getAuthHeaders, getStoredUser } from "../auth";
import { useCart } from "../contexts/CartContext";
import BackButton from "./BackButton";
import { useFallbackImage } from "./imageFallback";

const itemKey = (item) => item.id || item._id;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getStoredUser();
  const { cart, clearCart } = useCart();
  const buyNowItems = Array.isArray(location.state?.buyNowItems) ? location.state.buyNowItems : [];
  const checkoutItems = buyNowItems.length ? buyNowItems : cart;
  const [placingOrder, setPlacingOrder] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "Cash on Delivery",
  });

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [checkoutItems]
  );
  const deliveryFee = subtotal > 0 && subtotal < 999 ? 79 : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!checkoutItems.length || placingOrder) return;

    setPlacingOrder(true);
    try {
      const res = await fetch(`${API_BASE_URL}/order/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
          },
          shippingAddress: {
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          paymentMethod: form.paymentMethod,
          items: checkoutItems.map((item) => ({
            productId: item._id || item.id,
            name: item.name || item.title,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const firstError = data.errors ? Object.values(data.errors)[0] : data.message;
        Swal.fire({ icon: "error", title: "Order failed", text: firstError || "Please check your details." });
        return;
      }

      if (!buyNowItems.length) clearCart();
      Swal.fire({ icon: "success", title: "Order placed", text: `Your order ${data._id.slice(-6).toUpperCase()} has been created.` });
      navigate("/orders");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Order failed", text: "Could not connect to the order service." });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!checkoutItems.length) {
    return (
      <main className="page-shell">
        <section className="section-wrap grid min-h-[calc(100vh-5rem)] place-items-center py-12">
          <div className="surface max-w-lg p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-900">
              <i className="fa-solid fa-cart-shopping text-2xl" />
            </div>
            <h1 className="mt-5 text-3xl font-black text-stone-950">Cart is empty</h1>
            <p className="mt-2 text-stone-600">Add products before placing an order.</p>
            <button className="btn-primary mt-6" onClick={() => navigate("/browse")}>Browse Products</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="section-wrap py-12">
        <BackButton fallback="/cart" />
        <div className="mb-8">
          <p className="section-kicker">Checkout</p>
          <h1 className="section-title mt-2">Place your order</h1>
          <p className="section-copy mt-3">Add delivery details and confirm your Craftigen order.</p>
        </div>

        <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="surface p-6 sm:p-8">
            <h2 className="text-xl font-black text-stone-950">Delivery details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Full name</label>
                <input className="field" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input className="field" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Address</label>
                <textarea className="field min-h-28 resize-y" name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div>
                <label className="field-label">City</label>
                <input className="field" name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div>
                <label className="field-label">State</label>
                <input className="field" name="state" value={form.state} onChange={handleChange} required />
              </div>
              <div>
                <label className="field-label">Pincode</label>
                <input className="field" name="pincode" value={form.pincode} onChange={handleChange} required />
              </div>
              <div>
                <label className="field-label">Payment</label>
                <select className="field" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                  <option>Cash on Delivery</option>
                  <option>UPI</option>
                  <option>Card</option>
                </select>
              </div>
            </div>
          </div>

          <aside className="surface h-fit p-6">
            <h2 className="text-xl font-black text-stone-950">Order summary</h2>
            <div className="mt-5 space-y-4">
              {checkoutItems.map((item) => (
                <div key={itemKey(item)} className="flex gap-3">
                  <img className="h-14 w-14 rounded-xl object-cover" src={item.image} alt={item.name || item.title} onError={useFallbackImage} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-stone-950">{item.name || item.title}</p>
                    <p className="mt-1 text-xs font-bold text-stone-500">Qty {item.quantity} x Rs {Number(item.price).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="my-6 border-t border-stone-200" />
            <div className="space-y-3 text-sm font-bold text-stone-600">
              <div className="flex justify-between"><span>Subtotal</span><span>Rs {subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee ? `Rs ${deliveryFee}` : "Free"}</span></div>
            </div>
            <div className="mt-5 flex justify-between text-xl font-black text-stone-950">
              <span>Total</span>
              <span>Rs {total.toLocaleString("en-IN")}</span>
            </div>
            <button type="submit" className="btn-primary mt-6 w-full" disabled={placingOrder}>
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </aside>
        </form>
      </section>
    </main>
  );
};

export default Checkout;
