import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useFallbackImage } from "./imageFallback";
import BackButton from "./BackButton";

const itemKey = (item) => item.id || item._id;

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const totalPrice = cart.reduce((acc, item) => acc + Number(item.price || 0) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <main className="page-shell">
        <section className="section-wrap py-8">
          <BackButton fallback="/browse" />
        </section>
        <section className="section-wrap grid min-h-[calc(100vh-14rem)] place-items-center pb-12">
          <div className="surface max-w-xl p-10 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-900">
              <i className="fa-solid fa-bag-shopping text-2xl" />
            </div>
            <h1 className="text-3xl font-black text-stone-950">Your cart is empty</h1>
            <p className="mt-3 text-stone-600">Add some handcrafted pieces and they&apos;ll appear here.</p>
            <button className="btn-primary mt-6" onClick={() => navigate("/browse")}>Browse Products</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="section-wrap py-12">
        <div className="mb-8">
          <BackButton fallback="/browse" />
          <p className="section-kicker">Cart</p>
          <h1 className="section-title mt-2">Your selected pieces</h1>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.map((item) => (
              <article className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center" key={itemKey(item)}>
                <img className="h-28 w-full rounded-2xl object-cover sm:w-28" src={item.image} alt={item.title || item.name} onError={useFallbackImage} />
                <div className="flex-1">
                  <h3 className="text-lg font-black text-stone-950">{item.title || item.name}</h3>
                  <p className="mt-1 text-sm font-bold text-emerald-800">Rs {item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white font-black" onClick={() => updateQuantity(itemKey(item), "decrease")}>-</button>
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-emerald-900 font-black text-white" onClick={() => updateQuantity(itemKey(item), "increase")}>+</button>
                  <button className="btn-danger" onClick={() => removeFromCart(itemKey(item))}>Remove</button>
                </div>
              </article>
            ))}
          </div>
          <aside className="surface h-fit p-6">
            <h2 className="text-xl font-black text-stone-950">Order summary</h2>
            <div className="my-6 border-t border-stone-200" />
            <div className="flex items-center justify-between text-lg font-black">
              <span>Total</span>
              <span>Rs {totalPrice}</span>
            </div>
            <button className="btn-primary mt-6 w-full" onClick={() => navigate("/checkout")}>Checkout</button>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Cart;
