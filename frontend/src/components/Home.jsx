import React from "react";
import { Link } from "react-router-dom";
import { useFallbackImage } from "./imageFallback";

const heroStats = [
  { value: "32", label: "curated products" },
  { value: "4.6", label: "average rating" },
  { value: "7", label: "day replacement" },
];

const categoryTiles = [
  {
    name: "Pooja Essentials",
    category: "Pooja",
    copy: "Brass accents, diyas, bells, and devotional pieces for daily rituals.",
    image: "/img/products/diya.jpg",
    color: "from-rose-950/80",
  },
  {
    name: "Home Decor",
    category: "Home Decor",
    copy: "Hand-painted accents, figurines, and statement details for warm interiors.",
    image: "/img/products/Royal_free.jpg",
    color: "from-emerald-950/80",
  },
  {
    name: "Kitchen & Serveware",
    category: "Kitchen",
    copy: "Copper, ceramic, and painted glass pieces made for hosting beautifully.",
    image: "/img/products/glass_handcrafted.jpg",
    color: "from-sky-950/75",
  },
  {
    name: "Bags & Gifting",
    category: "Bags",
    copy: "Textured handmade finds with color, utility, and gift-ready charm.",
    image: "/img/products/hand_bags.jpg",
    color: "from-stone-950/75",
  },
];

const collectionRows = [
  {
    title: "Festive Table Edit",
    copy: "Serveware, diyas, and rich metallic finishes for celebration-ready settings.",
    image: "/img/products/copper_bowl.jpeg",
  },
  {
    title: "Color Craft Studio",
    copy: "Painted pots, jars, and playful decor pieces that brighten modern homes.",
    image: "/img/products/Flower_pot.jpg",
  },
  {
    title: "Devotional Corners",
    copy: "Spiritual accents with warmth, shine, and traditional detail.",
    image: "/img/products/Ganesha_arti.jpeg",
  },
];

const trendingProducts = [
  {
    title: "Festive Pooja Picks",
    category: "Pooja",
    price: 540,
    badge: "Festive Pick",
    image: "/img/products/diya.jpg",
  },
  {
    title: "Handmade Home Accents",
    category: "Home Decor",
    price: 980,
    badge: "Handmade",
    image: "/img/products/elephants_wooden.jpg",
  },
  {
    title: "Kitchen & Serveware",
    category: "Kitchen",
    price: 799,
    badge: "Top Rated",
    image: "/img/products/design_cofeecup.jpeg",
  },
  {
    title: "Gift Ready Sets",
    category: "Gifting",
    price: 1790,
    badge: "Curated Set",
    image: "/img/products/items_set.jpg",
  },
];

const featureBadges = [
  { icon: "fa-truck-fast", title: "Reliable Delivery", copy: "Clear delivery timelines on every product." },
  { icon: "fa-gem", title: "Curated Quality", copy: "Selected pieces with distinct craft character." },
  { icon: "fa-gift", title: "Gift Ready", copy: "Great for festivals, homes, and special occasions." },
];

const Home = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5efe5] text-stone-950">
      <section className="relative overflow-hidden bg-[#10201d] text-white">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-55"
            src="/img/products/Bombay_store_banner_with_logo2.jpeg"
            alt="Craftigen handmade product collection"
            onError={useFallbackImage}
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(16,32,29,0.96)_0%,rgba(16,32,29,0.82)_42%,rgba(16,32,29,0.30)_100%)]" />
        </div>

        <div className="section-wrap relative grid min-h-[calc(100vh-5rem)] gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
          <div className="min-w-0 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">Craftigen Indian Handicrafts</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.03] sm:text-6xl lg:text-7xl">
              Handmade pieces that make every corner feel considered.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-stone-100 sm:text-lg">
              Explore colorful decor, pooja essentials, serveware, bags, and gifting pieces curated for homes that feel personal and polished.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/browse" className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-black text-stone-950 shadow-[0_18px_45px_rgba(251,191,36,0.24)] transition hover:-translate-y-0.5 hover:bg-amber-200">
                Shop Collection <i className="fa-solid fa-arrow-right" />
              </Link>
              <Link to="/contactus" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-stone-950">
                Custom Order
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur min-[420px]:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="border-b border-white/10 p-4 last:border-b-0 min-[420px]:border-b-0 min-[420px]:border-r min-[420px]:last:border-r-0">
                  <p className="text-2xl font-black text-amber-200">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {collectionRows.map((item) => (
              <Link key={item.title} to="/browse" className="group grid grid-cols-[88px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/15 bg-white/12 p-3 shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:bg-white/18 min-[420px]:grid-cols-[112px_minmax(0,1fr)]">
                <img className="h-[88px] w-[88px] rounded-xl object-cover transition duration-500 group-hover:scale-105 min-[420px]:h-28 min-[420px]:w-28" src={item.image} alt={item.title} onError={useFallbackImage} />
                <div className="min-w-0 px-4 py-2">
                  <h2 className="text-lg font-black">{item.title}</h2>
                  <p className="mt-2 text-sm leading-5 text-white/72">{item.copy}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-black text-amber-200">
                    Explore <i className="fa-solid fa-arrow-right transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Shop By Mood</p>
            <h2 className="section-title mt-2">Collections that feel easy to choose</h2>
          </div>
          <Link to="/browse" className="inline-flex items-center gap-2 text-sm font-black text-emerald-900">
            View all products <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categoryTiles.map((tile) => (
            <Link key={tile.name} to="/browse" className="group relative min-h-[340px] overflow-hidden rounded-2xl shadow-[0_18px_55px_rgba(42,38,30,0.12)]">
              <img className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" src={tile.image} alt={tile.name} onError={useFallbackImage} />
              <div className={`absolute inset-0 bg-gradient-to-t ${tile.color} via-stone-950/20 to-transparent`} />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black backdrop-blur">{tile.category}</span>
                <h3 className="mt-3 text-2xl font-black leading-tight">{tile.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">{tile.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#122622] py-16 text-white">
        <div className="section-wrap grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Why Craftigen</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Built like a modern store, filled with craft-led products.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              The store is designed for quick scanning, confident shopping, and a premium handmade feel from first click to product detail.
            </p>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-3">
            {featureBadges.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-300 text-stone-950">
                  <i className={`fa-solid ${feature.icon}`} />
                </span>
                <h3 className="mt-5 text-lg font-black">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Trending Now</p>
            <h2 className="section-title mt-2">Customer favourites</h2>
          </div>
          <p className="section-copy">A tighter product grid with richer imagery, cleaner prices, and obvious action targets.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trendingProducts.map((product) => (
            <Link key={product.title} to="/browse" className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_18px_45px_rgba(49,45,37,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(49,45,37,0.15)]">
              <span className="relative block overflow-hidden bg-stone-100">
                <img className="h-64 w-full object-cover transition duration-700 group-hover:scale-110" src={product.image} alt={product.title} onError={useFallbackImage} />
                <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-black text-stone-950 shadow-sm">{product.badge}</span>
              </span>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">{product.category}</p>
                <h3 className="mt-2 min-h-14 text-lg font-black leading-7 text-stone-950 group-hover:text-emerald-900">{product.title}</h3>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xl font-black text-stone-950">Rs {Number(product.price).toLocaleString("en-IN")}</p>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone-950 text-white transition group-hover:bg-amber-300 group-hover:text-stone-950">
                    <i className="fa-solid fa-arrow-right" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-wrap pb-16">
        <div className="grid min-w-0 overflow-hidden rounded-3xl bg-[#8f2f22] text-white shadow-[0_28px_80px_rgba(78,36,25,0.20)] lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="p-8 sm:p-10 lg:p-12">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">Gift Better</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">Find handmade gifts that do not feel ordinary.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 sm:text-base">
              Browse curated product sets, devotional accents, decor, and festive pieces with a refined handcrafted character.
            </p>
            <Link to="/browse" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#8f2f22] transition hover:-translate-y-0.5 hover:bg-amber-100">
              Browse Gift Picks <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
          <img className="h-72 w-full object-cover lg:h-full" src="/img/products/items_set.jpg" alt="Assorted handicraft gift set" onError={useFallbackImage} />
        </div>
      </section>
    </main>
  );
};

export default Home;
