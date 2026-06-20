import React from "react";

const brandLogoUrl = "https://thebombaystore.com/cdn/shop/files/favicon_32x32.png?v=1616503590";

const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-100">
      <div className="section-wrap grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-lg shadow-amber-900/10 ring-1 ring-amber-300/40">
              <img className="h-8 w-8 object-contain" src={brandLogoUrl} alt="Craftigen elephant logo" />
            </span>
            <div>
              <p className="text-lg font-black">Craftigen</p>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Handcrafted Store</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-stone-300">
            Curated Indian handicrafts, decor, gifting, and artisan-led collections for modern homes.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-amber-300">Shop</h3>
          <div className="grid gap-3 text-sm text-stone-300">
            <a href="/browse">Home Decor</a>
            <a href="/browse">Artifacts</a>
            <a href="/browse">Gifting</a>
            <a href="/browse">Accessories</a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-amber-300">Support</h3>
          <div className="grid gap-3 text-sm text-stone-300">
            <a href="/contactus">Contact Us</a>
            <a href="/manageuser">Profile</a>
            <a href="/cart">Cart</a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-amber-300">Contact</h3>
          <div className="space-y-2 text-sm text-stone-300">
            <p>orders@craftigenstore.com</p>
            <p>Mon to Sat, 10 AM to 6 PM</p>
          </div>
          <div className="mt-5 flex gap-3">
            {["facebook-f", "twitter", "instagram", "linkedin-in"].map((icon) => (
              <a key={icon} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-amber-400 hover:text-stone-950" href="#!">
                <i className={`fab fa-${icon}`} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs font-semibold text-stone-400">
        © {new Date().getFullYear()} Craftigen Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
