import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import useUserContext from "../UserContext";
import { useCart } from "../contexts/CartContext";
import { isAdminUser } from "../auth";
import Avatar from "./Avatar";

const brandLogoUrl = "https://thebombaystore.com/cdn/shop/files/favicon_32x32.png?v=1616503590";

const publicLinks = [
  { label: "Home", to: "/home" },
  { label: "Browse", to: "/browse" },
  { label: "Contact", to: "/contactus" },
];

const adminBaseLinks = [
  { label: "Home", to: "/home" },
  { label: "Browse", to: "/browse" },
  { label: "Your Orders", to: "/orders" },
];

const adminLinks = [
  { label: "Add Product", to: "/addproduct" },
  { label: "Manage Users", to: "/manageuser" },
  { label: "View Orders", to: "/admin/orders" },
  { label: "Tracking", to: "/admin/tracking" },
];

const Navbar = () => {
  const { currentUser, loggedIn, logout } = useUserContext();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const profilePath = "/profile";
  const navLinks = loggedIn
    ? isAdminUser(currentUser)
      ? [...adminBaseLinks, ...adminLinks]
      : [...publicLinks, { label: "Your Orders", to: "/orders" }]
    : publicLinks;

  const navClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-bold transition ${
      isActive
        ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/15"
        : "text-stone-700 hover:bg-white hover:text-emerald-900"
    }`;

  useEffect(() => {
    if (!loggedIn) {
      setUserOpen(false);
      setMenuOpen(false);
    }
  }, [loggedIn]);

  const handleLogout = () => {
    setUserOpen(false);
    setMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-[#f7f4ef]/88 backdrop-blur-xl">
      <div className="section-wrap">
        <nav className="flex h-20 items-center justify-between gap-4">
          <NavLink to="/home" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-lg shadow-amber-900/10 ring-1 ring-amber-200">
              <img className="h-8 w-8 object-contain" src={brandLogoUrl} alt="Craftigen logo" />
            </span>
            <span>
              <span className="block text-lg font-black leading-5 tracking-tight text-stone-950">Craftigen</span>
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Handcrafted Store</span>
            </span>
          </NavLink>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {loggedIn && (
              <NavLink to="/cart" className="relative rounded-full border border-stone-200 bg-white px-4 py-3 text-stone-800 transition hover:-translate-y-0.5 hover:border-emerald-800 hover:text-emerald-900">
                <i className="fas fa-shopping-cart" />
                <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-amber-500 px-1 text-xs font-black text-stone-950">
                  {cart.length}
                </span>
              </NavLink>
            )}

            {loggedIn && currentUser ? (
              <div className="relative">
                <button onClick={() => setUserOpen((value) => !value)} className="flex items-center gap-3 rounded-full border border-stone-200 bg-white py-2 pl-2 pr-4 transition hover:border-emerald-800">
                  <Avatar className="h-10 w-10 rounded-full object-cover text-sm" src={currentUser.avatar} name={currentUser.name} />
                  <span className="max-w-28 truncate text-sm font-bold text-stone-800">{currentUser.name}</span>
                  <i className="fa-solid fa-chevron-down text-xs text-stone-500" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl">
                    <NavLink className="block rounded-xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900" to={profilePath} onClick={() => setUserOpen(false)}>
                      View Profile
                    </NavLink>
                    <button onClick={handleLogout} className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-rose-700 hover:bg-rose-50">
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login" className="btn-secondary py-2">Login</NavLink>
                <NavLink to="/signup" className="btn-primary py-2">Register</NavLink>
              </div>
            )}
          </div>

          <button onClick={() => setMenuOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-stone-200 bg-white text-stone-900 lg:hidden">
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </nav>

        {menuOpen && (
          <div className="grid gap-2 border-t border-stone-200 py-4 lg:hidden">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass} onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {loggedIn ? (
              <>
                <NavLink to="/cart" className="btn-secondary justify-between" onClick={() => setMenuOpen(false)}>
                  Cart <span>{cart.length}</span>
                </NavLink>
                <NavLink to="/orders" className="btn-secondary justify-center" onClick={() => setMenuOpen(false)}>
                  Your Orders
                </NavLink>
                <NavLink to={profilePath} className="btn-secondary justify-center" onClick={() => setMenuOpen(false)}>
                  View Profile
                </NavLink>
                {isAdminUser(currentUser) && (
                  <>
                    <NavLink to="/addproduct" className="btn-secondary justify-center" onClick={() => setMenuOpen(false)}>
                      Add Product
                    </NavLink>
                    <NavLink to="/manageuser" className="btn-secondary justify-center" onClick={() => setMenuOpen(false)}>
                      Manage Users
                    </NavLink>
                    <NavLink to="/admin/orders" className="btn-secondary justify-center" onClick={() => setMenuOpen(false)}>
                      View Orders
                    </NavLink>
                    <NavLink to="/admin/tracking" className="btn-secondary justify-center" onClick={() => setMenuOpen(false)}>
                      Tracking
                    </NavLink>
                  </>
                )}
                <button onClick={handleLogout} className="btn-danger justify-center">Log Out</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <NavLink to="/login" className="btn-secondary" onClick={() => setMenuOpen(false)}>Login</NavLink>
                <NavLink to="/signup" className="btn-primary" onClick={() => setMenuOpen(false)}>Register</NavLink>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
