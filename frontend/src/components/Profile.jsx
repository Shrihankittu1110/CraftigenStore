import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { getStoredUser, isAdminUser } from "../auth";
import Avatar from "./Avatar";
import BackButton from "./BackButton";

const accountCards = [
  {
    title: "Your Orders",
    copy: "Track purchases, view order history, and check delivery updates.",
    icon: "fa-box-open",
    to: "/orders",
    action: "View orders",
  },
  {
    title: "Login & Security",
    copy: "Update your name, email, password, and profile photo.",
    icon: "fa-shield-halved",
    action: "Edit profile",
    profileAction: true,
  },
  {
    title: "Your Cart",
    copy: "Review saved products before checkout.",
    icon: "fa-cart-shopping",
    to: "/cart",
    action: "Open cart",
  },
  {
    title: "Customer Support",
    copy: "Contact Craftigen for product help, custom orders, or delivery questions.",
    icon: "fa-headset",
    to: "/contactus",
    action: "Contact us",
    hideForAdmin: true,
  },
];

const Profile = () => {
  const currentUser = getStoredUser();
  const { cart } = useCart();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const profilePath = `/updateuser/${currentUser._id || currentUser.id}`;
  const visibleCards = accountCards.filter((card) => !(isAdminUser(currentUser) && card.hideForAdmin));

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-stone-950">
      <section className="border-b border-stone-200 bg-white">
        <div className="section-wrap py-8">
          <BackButton />
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">Your Account</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">View profile</h1>
        </div>
      </section>

      <section className="section-wrap grid gap-6 py-8 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="bg-[#14201e] p-6 text-white">
            <div className="flex items-center gap-4">
              <Avatar
                className="h-20 w-20 rounded-full border-4 border-white/20 object-cover text-3xl"
                textClassName="bg-amber-300 text-stone-950"
                src={currentUser.avatar}
                name={currentUser.name}
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white/70">Hello,</p>
                <h2 className="truncate text-2xl font-black">{currentUser.name}</h2>
                {isAdminUser(currentUser) && (
                  <span className="mt-2 inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-stone-950">Admin</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Email</p>
              <p className="mt-1 break-words text-sm font-bold text-stone-900">{currentUser.email}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Account type</p>
              <p className="mt-1 text-sm font-bold text-stone-900">{isAdminUser(currentUser) ? "Administrator" : "Customer"}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Cart items</p>
              <p className="mt-1 text-sm font-bold text-stone-900">{cart.length}</p>
            </div>
            <Link to={profilePath} className="btn-primary mt-2 w-full">
              Edit Profile <i className="fa-solid fa-pen" />
            </Link>
          </div>
        </aside>

        <div>
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-xl font-black text-stone-950">Account dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Manage your shopping, profile, and security from one clean account area.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {visibleCards.map((card) => {
              const target = card.profileAction ? profilePath : card.to;

              return (
                <Link key={card.title} to={target} className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
                  <div className="flex gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-xl text-emerald-900 transition group-hover:bg-emerald-900 group-hover:text-white">
                      <i className={`fa-solid ${card.icon}`} />
                    </span>
                    <div>
                      <h3 className="text-xl font-black text-stone-950">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{card.copy}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-emerald-900">
                        {card.action} <i className="fa-solid fa-arrow-right transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {isAdminUser(currentUser) && (
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Admin Tools</p>
              <h2 className="mt-2 text-xl font-black text-stone-950">Store management</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/addproduct" className="btn-primary">Add Product</Link>
                <Link to="/manageuser" className="btn-secondary">Manage Users</Link>
                <Link to="/admin/orders" className="btn-secondary">View Orders</Link>
                <Link to="/admin/tracking" className="btn-secondary">Tracking</Link>
                <Link to="/productlist" className="btn-secondary">Backend Products</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Profile;
