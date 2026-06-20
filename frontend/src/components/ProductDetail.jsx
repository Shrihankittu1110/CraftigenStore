import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE_URL, buildFileUrl } from "../config";
import { useCart } from "../contexts/CartContext";
import useUserContext from "../UserContext";
import { useFallbackImage } from "./imageFallback";
import ItemsData from "./dummyData";

const normalizeProduct = (product, source) => {
  if (!product) return null;

  return {
    id: product.id || product._id,
    title: product.title || product.name,
    price: product.price,
    rating: product.rating || 4.4,
    reviews: product.reviews || 128,
    category: product.category || "Handcrafted",
    material: product.material || "Artisan finish",
    colour: product.colour || product.color || "",
    dimensions: product.dimensions || "",
    weight: product.weight || product.itemWeight || "",
    brand: product.brand || "Craftigen",
    delivery: product.delivery || "3-6 business days",
    description:
      product.description ||
      "A carefully selected handcrafted piece made for gifting, styling, and everyday home decor. Designed to bring warmth, texture, and a crafted character to your space.",
    image: source === "backend" ? buildFileUrl(product.image) : product.image,
    raw: product,
  };
};

const getProductSpecs = (product) => {
  if (!product) return [];

  const specs = [
    ["Colour", product.colour],
    ["Material", product.material],
    ["Product Dimensions", product.dimensions],
    ["Item Weight", product.weight],
    ["Brand", product.brand],
  ];

  return specs.filter(([, value]) => value);
};

const ProductDetail = () => {
  const { source, id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { loggedIn } = useUserContext();
  const [backendProduct, setBackendProduct] = useState(null);
  const [loading, setLoading] = useState(source === "backend");

  useEffect(() => {
    const fetchBackendProduct = async () => {
      if (source !== "backend") return;

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/product/getid/${id}`);
        if (res.status === 200) {
          const data = await res.json();
          setBackendProduct(data);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendProduct();
  }, [id, source]);

  const product = useMemo(() => {
    if (source === "backend") {
      return normalizeProduct(backendProduct, "backend");
    }

    const catalogProduct = ItemsData.find((item) => String(item.id) === String(id));
    return normalizeProduct(catalogProduct, "catalog");
  }, [backendProduct, id, source]);

  const handleAddToCart = () => {
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
      ...product.raw,
      id: product.raw.id || product.raw._id,
      title: product.title,
      name: product.title,
      image: product.image,
      price: product.price,
    });
    Swal.fire({ icon: "success", title: "Added to cart" });
  };

  const handleBuyNow = () => {
    if (!loggedIn) {
      Swal.fire({
        icon: "info",
        title: "Login required",
        text: "Please login to buy products.",
      });
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: {
        buyNowItems: [
          {
            ...product.raw,
            id: product.raw.id || product.raw._id,
            title: product.title,
            name: product.title,
            image: product.image,
            price: product.price,
            quantity: 1,
          },
        ],
      },
    });
  };

  const productSpecs = getProductSpecs(product);

  if (loading) {
    return (
      <main className="page-shell">
        <section className="section-wrap grid min-h-[calc(100vh-5rem)] place-items-center py-12">
          <div className="surface p-8 text-center font-bold text-stone-600">Loading product...</div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page-shell">
        <section className="section-wrap grid min-h-[calc(100vh-5rem)] place-items-center py-12">
          <div className="surface max-w-lg p-10 text-center">
            <h1 className="text-3xl font-black text-stone-950">Product not found</h1>
            <p className="mt-3 text-stone-600">This product may have been removed or the link is incorrect.</p>
            <Link to="/browse" className="btn-primary mt-6">Back To Browse</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="section-wrap py-10">
        <Link to="/browse" className="mb-6 inline-flex items-center gap-2 text-sm font-black text-emerald-900">
          <i className="fa-solid fa-arrow-left" /> Back to products
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface overflow-hidden p-4">
            <div className="overflow-hidden rounded-[1.2rem] bg-stone-100">
              <img className="h-[420px] w-full object-cover sm:h-[560px]" src={product.image} alt={product.title} onError={useFallbackImage} />
            </div>
          </div>

          <div className="surface p-6 sm:p-8">
            <p className="section-kicker">{product.category}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-stone-950">{product.title}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-stone-950">
                <i className="fa-solid fa-star mr-1 text-amber-500" />
                {product.rating}
              </span>
              <span className="text-sm font-bold text-stone-500">{product.reviews} customer reviews</span>
            </div>

            <div className="my-7 border-t border-stone-200" />

            <p className="text-4xl font-black text-emerald-900">Rs {product.price}</p>
            <p className="mt-2 text-sm font-semibold text-stone-500">Inclusive of all taxes</p>

            <div className="mt-7 grid gap-4 rounded-[1.2rem] bg-white/70 p-5">
              {productSpecs.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
                  <span className="text-sm font-bold text-stone-500">{label}</span>
                  <span className="text-right text-sm font-black text-stone-950">{value}</span>
                </div>
              ))}
              <div className="border-t border-stone-200" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-stone-500">Delivery</span>
                <span className="text-sm font-black text-emerald-900">{product.delivery}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-stone-500">Return</span>
                <span className="text-sm font-black text-stone-950">7 day replacement</span>
              </div>
            </div>

            <div className="mt-7">
              <h2 className="text-lg font-black text-stone-950">About this item</h2>
              <p className="mt-3 leading-7 text-stone-600">{product.description}</p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button className="btn-primary w-full" onClick={handleAddToCart}>
                {loggedIn ? "Add To Cart" : "Login To Add"}
                <i className="fa-solid fa-bag-shopping" />
              </button>
              <button className="btn-secondary w-full" onClick={handleBuyNow}>
                {loggedIn ? "Buy Now" : "Login To Buy"}
                <i className="fa-solid fa-bolt" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
