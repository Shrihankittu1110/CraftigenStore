import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { API_BASE_URL, buildFileUrl } from "../config";
import { useFallbackImage } from "./imageFallback";
import useUserContext from "../UserContext";
import Swal from "sweetalert2";
import BackButton from "./BackButton";

const ListProduct = () => {
  const [productList, setProductList] = useState([]);
  const { category } = useParams();
  const { addToCart, cart } = useCart();
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const { loggedIn } = useUserContext();
  const navigate = useNavigate();

  const fetchProductList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/product/getall`);
      const data = await res.json();
      setProductList(category ? data.filter((prod) => prod.category === category) : data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, [category]);

  const handleAddToCart = (product) => {
    if (!loggedIn) {
      Swal.fire({
        icon: "info",
        title: "Login required",
        text: "Please login to add products to your cart.",
      });
      navigate("/login");
      return;
    }

    addToCart(product);
    setFeedbackMessage(`${product.name} added to cart`);
    setTimeout(() => setFeedbackMessage(""), 2000);
  };

  return (
    <main className="page-shell">
      <section className="section-wrap py-14">
        <div className="surface p-6 sm:p-8">
          <BackButton fallback="/profile" />
          <p className="section-kicker">Products</p>
          <h1 className="section-title mt-2">Festive favourites</h1>
          <p className="section-copy mt-3">Manage and shop uploaded products from your Craftigen backend.</p>
        </div>
      </section>

      <section className="section-wrap pb-16">
        {feedbackMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm font-bold text-emerald-900">
            {feedbackMessage}
          </div>
        )}

        {productList.length === 0 ? (
          <div className="surface p-10 text-center">
            <h2 className="text-2xl font-black text-stone-950">No products found</h2>
            <p className="mt-2 text-stone-600">Add products from the admin form to see them here.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productList.map((product) => (
              <article className="product-card" key={product._id}>
                <Link to={`/product/backend/${product._id}`} className="block overflow-hidden bg-stone-100">
                  <img className="product-image" src={buildFileUrl(product.image)} alt={product.name} onError={useFallbackImage} />
                </Link>
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <Link to={`/product/backend/${product._id}`} className="text-lg font-black text-stone-950 transition hover:text-emerald-900">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm font-semibold text-stone-500">{product.category}</p>
                    </div>
                    <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-900">Rs {product.price}</p>
                  </div>
                  <button className="btn-primary w-full" onClick={() => handleAddToCart(product)}>
                    {!loggedIn ? "Login To Add" : cart.some((item) => item._id === product._id) ? "Add Again" : "Add To Cart"}
                    <i className="fa-solid fa-bag-shopping" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default ListProduct;
