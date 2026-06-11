import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE_URL, buildFileUrl } from "../config";
import { useCart } from "../contexts/CartContext";
import useUserContext from "../UserContext";
import ItemsData from "./dummyData";
import { useFallbackImage } from "./imageFallback";

const refusalMessage = "I am sorry, this is not my work. I can only help with Craftigen Store products and shopping questions.";
const unavailableMessage = "Sorry, the items are not available right now.";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");

const wordAliases = {
  bag: ["bags", "purse", "sling", "laptop bag", "jute"],
  bags: ["bag", "purse", "sling", "laptop bag", "jute"],
  basket: ["baskets", "storage", "woven"],
  baskets: ["basket", "storage", "woven"],
  clock: ["clocks", "wall clock"],
  clocks: ["clock", "wall clock"],
  cup: ["cups", "mug", "tumbler", "glass"],
  cups: ["cup", "mug", "tumbler", "glass"],
  decor: ["decoration", "decorative", "home decor", "wall decor", "accent"],
  decoration: ["decor", "decorative", "home decor", "wall decor", "accent"],
  gift: ["gifts", "gifting", "present", "hamper"],
  gifts: ["gift", "gifting", "present", "hamper"],
  handmade: ["hand made", "handcrafted", "artisan", "craft"],
  handcrafted: ["handmade", "hand made", "artisan", "craft"],
  idol: ["idols", "god", "devotional", "pooja"],
  idols: ["idol", "god", "devotional", "pooja"],
  kitchen: ["cup", "bowl", "glass", "serving", "jar"],
  lamp: ["light", "lighting", "candle", "diya", "deepak"],
  pooja: ["puja", "devotional", "diya", "deepak", "bell", "ganesh", "krishna"],
  pot: ["pots", "flower pot", "terracotta", "planter"],
  pots: ["pot", "flower pot", "terracotta", "planter"],
  purse: ["bag", "bags", "sling"],
  tray: ["trays", "serveware", "serving"],
  trays: ["tray", "serveware", "serving"],
  wall: ["wall decor", "wall hanging", "frame", "mask"],
};

const singularize = (word) => {
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
};

const getTermVariants = (word) => {
  const singular = singularize(word);
  const variants = new Set([word, singular, `${singular}s`, ...(wordAliases[word] || []), ...(wordAliases[singular] || [])]);
  return Array.from(variants).filter(Boolean);
};

const getEditDistance = (a, b) => {
  if (a === b) return 0;
  if (!a || !b) return Math.max(a.length, b.length);

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
};

const isFuzzyWordMatch = (queryWord, productWord) => {
  if (queryWord.length < 4 || productWord.length < 4) return false;
  const lengthGap = Math.abs(queryWord.length - productWord.length);
  if (lengthGap > 2) return false;

  const distance = getEditDistance(queryWord, productWord);
  return distance <= (Math.min(queryWord.length, productWord.length) > 6 ? 2 : 1);
};

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
  category: product.category || "Handcrafted",
  material: product.material || "Artisan finish",
  description: product.description || "A carefully selected handcrafted product from Craftigen Store.",
});

const normalizeCatalogProduct = (product) => ({
  ...product,
  source: "catalog",
});

const catalogItems = ItemsData.map(normalizeCatalogProduct);

const storeKeywords = [
  "add",
  "available",
  "availability",
  "bag",
  "bags",
  "basket",
  "bell",
  "best",
  "bowl",
  "buy",
  "candle",
  "cart",
  "category",
  "cheap",
  "clock",
  "contact",
  "cost",
  "cup",
  "decor",
  "delivery",
  "diya",
  "find",
  "gift",
  "gifting",
  "glass",
  "handmade",
  "handcrafted",
  "item",
  "items",
  "journal",
  "kitchen",
  "material",
  "pooja",
  "pot",
  "pots",
  "price",
  "product",
  "products",
  "purse",
  "recommend",
  "search",
  "serveware",
  "show",
  "stationery",
  "store",
  "tray",
  "under",
  "wall",
];

const stopWords = new Set([
  "a",
  "about",
  "above",
  "all",
  "an",
  "and",
  "any",
  "are",
  "around",
  "available",
  "avaliable",
  "below",
  "best",
  "can",
  "craftigen",
  "do",
  "for",
  "from",
  "give",
  "have",
  "i",
  "in",
  "is",
  "me",
  "my",
  "of",
  "please",
  "price",
  "product",
  "products",
  "show",
  "store",
  "the",
  "there",
  "to",
  "under",
  "you",
]);

const suggestionPrompts = [
  "Show handmade bags under 1500",
  "Best rated wall decor",
  "Gift items below 1000",
  "Pooja products available",
];

const extractBudget = (message) => {
  const text = normalizeText(message);
  const match = text.match(/(?:under|below|less than|upto|up to)\s*(?:rs|inr|rupees)?\s*(\d+)/);
  if (!match) return null;
  return Number(match[1]);
};

const getQueryWords = (message) =>
  normalizeText(message)
    .replace("hand made", "handmade")
    .split(" ")
    .filter((word) => word.length > 2 && !stopWords.has(word));

const getSearchTerms = (message) => Array.from(new Set(getQueryWords(message).flatMap(getTermVariants)));

const getProductTokens = (item) =>
  normalizeText(`${item.title} ${item.category} ${item.material} ${item.description}`)
    .split(" ")
    .filter((word) => word.length > 2);

const getProductWords = (products) =>
  products.flatMap(getProductTokens);

const isStoreRelated = (message, products) => {
  const text = normalizeText(message);
  if (!text) return false;

  if (storeKeywords.some((word) => text.includes(word) || getTermVariants(word).some((variant) => text.includes(variant)))) return true;

  const queryWords = getQueryWords(message);
  const productWords = getProductWords(products);
  return queryWords.some((queryWord) =>
    getTermVariants(queryWord).some((variant) => productWords.includes(variant)) ||
    productWords.some((productWord) => isFuzzyWordMatch(queryWord, productWord))
  );
};

const getMatchDetails = (item, queryWords, rawQuery, budget) => {
  const haystack = normalizeText(`${item.title} ${item.category} ${item.material} ${item.description}`);
  const productTokens = getProductTokens(item);
  const reasons = [];
  let score = 0;

  queryWords.forEach((word) => {
    const variants = getTermVariants(word);
    const exactVariant = variants.find((variant) => haystack.includes(variant));
    const fuzzyVariant = exactVariant ? null : variants.find((variant) => productTokens.some((token) => isFuzzyWordMatch(variant, token)));

    if (!exactVariant && !fuzzyVariant) return;

    score += exactVariant ? (word.length > 4 ? 3 : 2) : 1.5;
    if (reasons.length < 2) reasons.push(fuzzyVariant ? `similar to "${word}"` : `matches "${word}"`);
  });

  if (rawQuery.includes("handmade") && haystack.includes("handcrafted")) {
    score += 2;
    reasons.push("handcrafted style");
  }

  if (rawQuery.includes("hand made") && haystack.includes("handmade")) score += 3;
  if (rawQuery.includes("bag") && haystack.includes("bags")) score += 3;
  if (rawQuery.includes("bags") && haystack.includes("bag")) score += 3;
  if (rawQuery.includes("best") || rawQuery.includes("top") || rawQuery.includes("rated")) score += (item.rating || 0) * 1.4;
  if (rawQuery.includes("gift") && normalizeText(`${item.category} ${item.description}`).includes("gift")) score += 4;

  if (budget) {
    if (Number(item.price) <= budget) {
      score += 4;
      reasons.push(`under Rs ${formatPrice(budget)}`);
    } else {
      score -= 7;
    }
  }

  if ((item.rating || 0) >= 4.6 && reasons.length < 3) reasons.push("high customer rating");
  if (item.badge && reasons.length < 3) reasons.push(item.badge);

  return { item, reasons: Array.from(new Set(reasons)).slice(0, 3), score };
};

const findProducts = (message, products) => {
  const rawQuery = normalizeText(message);
  const queryWords = getSearchTerms(message);
  const budget = extractBudget(message);

  if (queryWords.length === 0 && !budget) return [];

  return products
    .map((item) => getMatchDetails(item, queryWords, rawQuery, budget))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (b.item.rating || 0) - (a.item.rating || 0) || Number(a.item.price) - Number(b.item.price))
    .slice(0, 5);
};

const getCategorySummary = (products) => {
  const groups = products.reduce((acc, item) => {
    const category = item.category || "Handcrafted";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([category, count]) => `${category} (${count})`)
    .join(", ");
};

const getPriceRange = (products) => {
  const prices = products.map((item) => Number(item.price)).filter(Boolean);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

const buildBotReply = (message, products) => {
  const text = normalizeText(message);

  if (!isStoreRelated(message, products)) {
    return { tone: "guard", text: refusalMessage, matches: [], actions: [] };
  }

  if (text.includes("category") || text.includes("categories")) {
    return {
      tone: "info",
      text: `Craftigen currently has these product categories: ${getCategorySummary(products)}.`,
      matches: [],
      actions: ["Show handmade bags", "Show gifting products"],
    };
  }

  if (text.includes("delivery")) {
    return {
      tone: "info",
      text: "Delivery is listed on every product card. Most products show free delivery or arrive within 3-6 business days.",
      matches: [],
      actions: ["Show fast delivery products", "Show popular gifts"],
    };
  }

  if (text.includes("contact") || text.includes("support") || text.includes("help")) {
    return {
      tone: "info",
      text: "For store support, open the Contact Us page. For product suggestions, tell me the item, category, material, or budget.",
      matches: [],
      actions: ["Show bags", "Show home decor"],
    };
  }

  if (text.includes("price") || text.includes("cost") || text.includes("budget")) {
    const range = getPriceRange(products);
    return {
      tone: "info",
      text: `Craftigen products currently range from Rs ${formatPrice(range.min)} to Rs ${formatPrice(range.max)}. You can ask things like "gifts under 1000" or "bags under 1500".`,
      matches: [],
      actions: ["Gift items below 1000", "Show handmade bags under 1500"],
    };
  }

  const matches = findProducts(message, products);
  if (matches.length > 0) {
    const budget = extractBudget(message);
    const budgetCopy = budget ? ` within Rs ${formatPrice(budget)}` : "";

    return {
      tone: "products",
      text: `Here are the best Craftigen matches${budgetCopy}. I ranked them by product relevance, rating, and availability.`,
      matches,
      actions: ["Best rated products", "Show more gifts", "Show wall decor"],
    };
  }

  return {
    tone: "empty",
    text: unavailableMessage,
    matches: [],
    actions: ["Show all categories", "Show handmade bags", "Gift items below 1000"],
  };
};

const TypingIndicator = () => (
  <div className="w-fit rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
    <span className="sr-only">Assistant is typing</span>
    <span className="flex gap-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-800 [animation-delay:-0.2s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-800 [animation-delay:-0.1s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-800" />
    </span>
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [backendItems, setBackendItems] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      tone: "welcome",
      text: "Hi, I am your Craftigen shopping assistant. Ask for a product, category, material, budget, or gift idea and I will show matching store items.",
      matches: [],
      actions: suggestionPrompts,
    },
  ]);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { loggedIn } = useUserContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/product/getall`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setBackendItems(data.map(normalizeBackendProduct));
      } catch (error) {
        setBackendItems([]);
      }
    };

    fetchProducts();

    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const products = useMemo(() => (backendItems.length > 0 ? backendItems : catalogItems), [backendItems]);
  const categories = useMemo(() => Array.from(new Set(products.map((item) => item.category).filter(Boolean))).slice(0, 6), [products]);

  const pushBotReply = (message) => {
    const reply = buildBotReply(message, products);
    setIsTyping(true);

    typingTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, { id: Date.now() + 1, sender: "bot", ...reply }]);
      setIsTyping(false);
    }, 420);
  };

  const sendMessage = (message = input) => {
    const trimmed = message.trim();
    if (!trimmed || isTyping) return;

    setMessages((current) => [...current, { id: Date.now(), sender: "user", text: trimmed, matches: [], actions: [] }]);
    setInput("");
    setIsOpen(true);
    pushBotReply(trimmed);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleAddToCart = (product) => {
    if (!loggedIn) {
      Swal.fire({
        icon: "info",
        title: "Login required",
        text: "Please login to add products to your cart.",
      });
      navigate("/login");
      setIsOpen(false);
      return;
    }

    addToCart({
      ...product,
      id: product.id || product._id,
      name: product.title || product.name,
      image: product.image,
    });
    Swal.fire({ icon: "success", title: "Added to cart", timer: 1200, showConfirmButton: false });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section className="flex h-[min(690px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-[430px] flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-2xl shadow-stone-950/25">
          <header className="bg-[#13211f] text-white">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-md bg-amber-300 text-stone-950">
                  <i className="fa-solid fa-wand-magic-sparkles" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#13211f] bg-emerald-400" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">Craftigen AI Concierge</h2>
                  <p className="truncate text-xs text-white/70">{products.length} store products indexed</p>
                </div>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-md text-white transition hover:bg-white/10"
                type="button"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
              {categories.map((category) => (
                <button
                  key={category}
                  className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:border-amber-300 hover:bg-amber-300 hover:text-stone-950"
                  type="button"
                  onClick={() => sendMessage(`Show ${category}`)}
                >
                  {category}
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-[#f5f1e8] p-4">
            <div className="grid gap-4">
              {messages.map((message) => (
                <div key={message.id} className={`grid gap-2 ${message.sender === "user" ? "justify-items-end" : "justify-items-start"}`}>
                  <div
                    className={`max-w-[90%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.sender === "user"
                        ? "bg-emerald-900 text-white"
                        : message.tone === "guard"
                          ? "border border-rose-100 bg-rose-50 text-rose-900"
                          : "border border-stone-200 bg-white text-stone-800"
                    }`}
                  >
                    {message.sender === "bot" ? (
                      <p className="mb-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-800">
                        {message.tone === "guard" ? "Out of scope" : "Assistant"}
                      </p>
                    ) : null}
                    <p>{message.text}</p>
                  </div>

                  {message.matches?.length > 0 ? (
                    <div className="grid w-full gap-2">
                      {message.matches.map(({ item: product, reasons }) => {
                        const productId = product.id || product._id;
                        const detailPath = `/product/${product.source}/${productId}`;

                        return (
                          <article
                            key={`${product.source}-${productId}`}
                            className="grid grid-cols-[86px_1fr] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
                          >
                            <Link to={detailPath} onClick={() => setIsOpen(false)}>
                              <img
                                className="h-full min-h-[128px] w-[86px] object-cover"
                                src={product.image}
                                alt={product.title}
                                onError={useFallbackImage}
                              />
                            </Link>
                            <div className="min-w-0 p-3">
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="truncate rounded-full bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-900">
                                  {product.category}
                                </span>
                                <span className="shrink-0 text-xs font-black text-amber-500">
                                  <i className="fa-solid fa-star mr-1" />
                                  {product.rating || 4.4}
                                </span>
                              </div>
                              <Link className="line-clamp-2 text-sm font-black leading-5 text-stone-950 hover:text-emerald-900" to={detailPath} onClick={() => setIsOpen(false)}>
                                {product.title}
                              </Link>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{product.description}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {reasons.map((reason) => (
                                  <span key={reason} className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-600">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2">
                                <p className="text-base font-black text-emerald-900">Rs {formatPrice(product.price)}</p>
                                <button
                                  className="grid h-9 w-9 place-items-center rounded-full bg-[#ffd814] text-stone-950 transition hover:bg-[#f7ca00]"
                                  type="button"
                                  aria-label={`Add ${product.title} to cart`}
                                  onClick={() => handleAddToCart(product)}
                                >
                                  <i className="fa-solid fa-cart-plus" />
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : null}

                  {message.actions?.length > 0 && message.sender === "bot" ? (
                    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                      {message.actions.map((action) => (
                        <button
                          key={action}
                          className="shrink-0 rounded-full border border-emerald-100 bg-white px-3 py-2 text-xs font-bold text-emerald-900 shadow-sm transition hover:border-emerald-700"
                          type="button"
                          onClick={() => sendMessage(action)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {isTyping ? <TypingIndicator /> : null}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-stone-200 bg-white p-3">
            <div className="mb-3 grid grid-cols-2 gap-2">
              {suggestionPrompts.slice(0, 2).map((prompt) => (
                <button
                  key={prompt}
                  className="truncate rounded-md bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-amber-100"
                  type="button"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                className="min-w-0 flex-1 rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-4 focus:ring-emerald-100"
                type="text"
                value={input}
                placeholder="Ask for products, price, gifts"
                onChange={(event) => setInput(event.target.value)}
              />
              <button
                className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-amber-300 text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                aria-label="Send message"
                disabled={isTyping}
              >
                <i className="fa-solid fa-paper-plane" />
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          className="group flex items-center gap-3 rounded-lg bg-[#13211f] px-4 py-3 text-white shadow-2xl shadow-stone-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-900"
          type="button"
          aria-label="Open Craftigen chat"
          onClick={() => setIsOpen(true)}
        >
          <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-300 text-stone-950">
            <i className="fa-solid fa-headset" />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-black">Ask AI</span>
            <span className="block text-xs text-white/70">Find products</span>
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
