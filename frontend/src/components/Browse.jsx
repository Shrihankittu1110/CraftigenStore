import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useFallbackImage } from "./imageFallback";
import useUserContext from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE_URL, buildFileUrl } from "../config";
import ItemsData from "./dummyData";

const formatPrice = (price) => Number(price).toLocaleString("en-IN");

const normalizeBackendProduct = (product) => ({
  ...product,
  id: product._id,
  source: "backend",
  title: product.title || product.name,
  image: buildFileUrl(product.image),
  rating: product.rating || 4.4,
  reviews: product.reviews || 0,
  delivery: product.delivery || "3-6 business days",
  badge: product.badge || "Craftigen",
});

const normalizeCatalogProduct = (product) => ({
  ...product,
  source: "catalog",
});

const spotlightCategories = ["Home Decor", "Kitchen", "Wall Decor", "Gifting"];
const catalogItems = ItemsData.map(normalizeCatalogProduct);

const Browse = () => {
  const [backendItems, setBackendItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const { addToCart } = useCart();
  const { loggedIn } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/product/getall`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const mapped = data.map(normalizeBackendProduct);
        setBackendItems(mapped);
        setLoadError("");
      } catch (error) {
        setBackendItems([]);
        setLoadError("Products could not be loaded. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    };

    const timeout = window.setTimeout(fetchProducts, 250);
    return () => window.clearTimeout(timeout);
  }, []);

  const sourceItems = backendItems.length > 0 ? backendItems : catalogItems;

  const categories = useMemo(() => {
    const values = sourceItems.map((item) => item.category).filter(Boolean);
    return ["All", ...Array.from(new Set(values)).filter((category) => category !== "decor-item")];
  }, [sourceItems]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const items = sourceItems.filter((item) => {
      const title = item.title || item.name || "";
      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        String(item.category || "").toLowerCase().includes(query) ||
        String(item.material || "").toLowerCase().includes(query) ||
        String(item.colour || item.color || "").toLowerCase().includes(query) ||
        String(item.dimensions || "").toLowerCase().includes(query) ||
        String(item.weight || "").toLowerCase().includes(query) ||
        String(item.brand || "").toLowerCase().includes(query) ||
        String(item.description || "").toLowerCase().includes(query);
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...items].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "reviews") return (b.reviews || 0) - (a.reviews || 0);
      return (b.reviews || 0) + (b.rating || 0) * 100 - ((a.reviews || 0) + (a.rating || 0) * 100);
    });
  }, [sourceItems, searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = (item) => {
    if (!loggedIn) {
      Swal.fire({
        icon: "info",
        title: "Login required",
        text: "Please login to add products to your cart.",
      });
      navigate("/login");
      return;
    }

    addToCart({
      ...item,
      id: item.id || item._id,
      name: item.title || item.name,
      image: item.image,
    });
    Swal.fire({ icon: "success", title: "Added to cart", timer: 1200, showConfirmButton: false });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortBy("featured");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f0e8] text-stone-950">
      <section
        className="relative overflow-hidden text-white"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14, 24, 21, 0.34), rgba(14, 24, 21, 0.34)), url("/img/products/Bombay_store_banner_with_logo2.jpeg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#0f1716]/15" />
        <div className="section-wrap relative z-10 grid max-w-full gap-6 py-8 lg:grid-cols-[1fr_430px] lg:items-center lg:py-10">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Craftigen Marketplace</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">Browse fresh handmade collections</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              Search real store products by craft, category, material, and price.
            </p>

            <div className="mt-6 flex w-full max-w-full overflow-hidden rounded-lg border-2 border-amber-400 bg-white shadow-xl shadow-black/20">
              <select
                className="hidden border-r border-stone-200 bg-stone-100 px-3 text-sm font-bold text-stone-700 outline-none sm:block"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search products, material, category"
                className="min-w-0 flex-1 px-4 py-3 text-sm text-stone-950 outline-none"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <button className="grid w-14 place-items-center bg-amber-400 text-stone-950">
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </div>

            <div className="mt-5 flex max-w-full flex-wrap gap-2">
              {spotlightCategories.map((category) => (
                <button
                  key={category}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:border-amber-300 hover:bg-amber-300 hover:text-stone-950"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 items-start justify-start lg:justify-end">
            <div className="w-full max-w-[280px] rounded-2xl border border-amber-300/30 bg-amber-300 p-5 text-stone-950 shadow-xl shadow-black/10 backdrop-blur-sm sm:w-auto">
              <p className="text-3xl font-black">{filteredItems.length}</p>
              <p className="text-sm font-bold">products matching your filters</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="section-wrap max-w-full py-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-stone-600">
              {loading ? "Loading products..." : <>Showing <span className="font-black text-stone-950">{filteredItems.length}</span> results.</>}
            </p>
            <button className="w-fit text-xs font-black uppercase tracking-wide text-emerald-800" onClick={resetFilters}>
              Clear filters
            </button>
          </div>

          <div className="grid max-w-full gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-[#fbf8f1] p-4 shadow-sm">
            <div className="min-w-0">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-stone-500">Category</p>
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                      selectedCategory === category ? "bg-[#14201e] text-white shadow-md" : "bg-white text-stone-700 hover:bg-amber-100"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid min-w-0 gap-4 md:grid-cols-[1fr_240px] lg:items-end">
              <div />
              <label className="flex flex-col gap-2 text-sm font-bold text-stone-700">
                Sort by
                <select className="w-full min-w-0 rounded-full border border-stone-300 bg-white px-4 py-2 outline-none focus:border-amber-500" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap max-w-full py-6">
        <div className="min-w-0">
          {loadError ? (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-black text-stone-950">Products unavailable</h2>
              <p className="mt-2 text-stone-600">{loadError}</p>
              <button className="btn-primary mt-6" onClick={resetFilters}>Try Again</button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-black text-stone-950">No products found</h2>
              <p className="mt-2 text-stone-600">Try another search term or clear filters.</p>
              <button className="btn-primary mt-6" onClick={resetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredItems.map((item) => {
                const detailPath = `/product/${item.source}/${item.id || item._id}`;

                return (
                  <article key={`${item.source}-${item.id || item._id}`} className="grid min-w-0 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl md:grid-cols-[250px_1fr_200px]">
                    <Link to={detailPath} className="group relative overflow-hidden bg-stone-100">
                      <img className="h-72 w-full object-cover transition duration-500 group-hover:scale-105 md:h-full" src={item.image} alt={item.title} onError={useFallbackImage} />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-stone-900 shadow-sm">{item.badge}</span>
                    </Link>

                    <div className="min-w-0 p-5">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">{item.category}</span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">{item.material}</span>
                        {(item.colour || item.color) && (
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">{item.colour || item.color}</span>
                        )}
                      </div>
                      <Link to={detailPath} className="text-xl font-black leading-7 text-[#0f1111] hover:text-[#c7511f] hover:underline">
                        {item.title || item.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-black text-[#007185]">{item.rating}</span>
                        <span className="text-amber-500">{"\u2605".repeat(Math.round(item.rating || 4))}</span>
                        <span className="text-[#007185]">{Number(item.reviews || 0).toLocaleString("en-IN")} ratings</span>
                      </div>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{item.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-stone-600">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-900">{item.delivery}</span>
                        <span className="rounded-full bg-stone-100 px-3 py-1">Sold by Craftigen Store</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between border-t border-stone-100 bg-[#faf7f0] p-5 md:border-l md:border-t-0">
                      <div>
                        <p className="text-sm font-bold text-stone-500">Price</p>
                        <p className="mt-1 text-3xl font-black text-[#0f1111]">
                          <span className="align-super text-sm">Rs</span> {formatPrice(item.price)}
                        </p>
                        <p className="mt-2 text-sm font-bold text-emerald-800">In stock</p>
                      </div>
                      <div className="mt-5 grid gap-2">
                        <button className="rounded-full bg-[#ffd814] px-4 py-2 text-sm font-bold text-stone-950 transition hover:bg-[#f7ca00]" onClick={() => handleAddToCart(item)}>
                          {loggedIn ? "Add to Cart" : "Login to Add"}
                        </button>
                        <Link to={detailPath} className="rounded-full bg-[#ffa41c] px-4 py-2 text-center text-sm font-bold text-stone-950 transition hover:bg-[#fa8900]">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Browse;
