"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { ProductGrid } from "@/components/product-grid";
import { useAuth } from "@/lib/store";
import { Sparkles, Search, Sun, Moon, Filter } from "lucide-react";

/* -------------------------
   Types
   ------------------------- */
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  createdAt?: string;
  featured?: boolean;
}

/* -------------------------
   Helpers
   ------------------------- */
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* -------------------------
   Component
   ------------------------- */
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">(
    "newest"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(
    (typeof window !== "undefined" && (localStorage.getItem("theme") as any)) ||
      "light"
  );

  // wishlist (local persistence)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const isAuthenticated = useAuth((s) => s.isAuthenticated());

  // Carousel state (featured)
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<number | null>(null);

  /* -------------------------
     Fetch products
     ------------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!mounted) return;
        // normalize id field (support both id and _id)
        const normalized = data.map((p: any) => ({
          ...p,
          id: p.id || p._id || String(p._id),
        }));
        setProducts(normalized);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    })();

    // load wishlist from localStorage
    const raw = typeof window !== "undefined" && localStorage.getItem("wishlist");
    if (raw) {
      try {
        const arr = JSON.parse(raw) as string[];
        setWishlist(new Set(arr));
      } catch {}
    }

    return () => {
      mounted = false;
      if (carouselRef.current) {
        window.clearInterval(carouselRef.current);
      }
    };
  }, []);

  /* -------------------------
     Theme handling
     ------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  /* -------------------------
     Derived lists
     ------------------------- */
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  // Search & Filter with debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doDebounce = useRef(
    debounce((q: string) => {
      setDebouncedSearch(q);
      setCurrentPage(1);
    }, 300)
  ).current;

  useEffect(() => {
    doDebounce(searchQuery);
  }, [searchQuery, doDebounce]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (minPrice !== null) list = list.filter((p) => p.price >= minPrice);
    if (maxPrice !== null) list = list.filter((p) => p.price <= maxPrice);

    // sort
    list.sort((a, b) => {
      if (sortBy === "newest") {
        const aTime = new Date(a.createdAt || "").getTime() || 0;
        const bTime = new Date(b.createdAt || "").getTime() || 0;
        return bTime - aTime;
      }
      if (sortBy === "price-asc") return a.price - b.price;
      return b.price - a.price;
    });

    return list;
  }, [products, selectedCategory, debouncedSearch, minPrice, maxPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* -------------------------
     Carousel (featured)
     ------------------------- */
  const featured = products
  .sort((a, b) => b.price - a.price)
  .slice(0, 5);


  useEffect(() => {
    if (featured.length <= 1) return;
    // auto-advance carousel
    carouselRef.current = window.setInterval(() => {
      setCarouselIndex((i) => (i + 1) % featured.length);
    }, 4500);
    return () => {
      if (carouselRef.current) window.clearInterval(carouselRef.current);
    };
  }, [featured.length]);

  /* -------------------------
     Wishlist handlers
     ------------------------- */
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      // persist
      localStorage.setItem("wishlist", JSON.stringify(Array.from(copy)));
      // optionally: call server API if implemented:
      // fetch("/api/wishlist", { method: "POST", body: JSON.stringify({ productId: id }) })
      return copy;
    });
  };

  /* -------------------------
     Add to cart helper (dispatch global event)
     ------------------------- */
  const addToCartAndNotify = async (productId: string) => {
    if (!isAuthenticated()) {
      // redirecting should be handled by ProductGrid/button; leaving this helper for future
      return;
    }
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed add to cart", err);
    }
  };

  /* -------------------------
     Render
     ------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-slate-900 transition-colors">
      <Navbar />

      {/* HERO / FEATURED */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="w-full lg:w-1/2">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="text-primary" size={22} />
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Pro Collection
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
                Curated Picks — built for quality and style
              </h1>

              <p className="text-muted-foreground max-w-xl leading-relaxed mb-6">
                Our pro collection highlights the best craftsmanship and modern
                design. Explore, wishlist, and checkout with confidence.
              </p>

              <div className="flex gap-3 items-center">
                <div className="relative w-full max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white/80 dark:bg-slate-800 border border-border focus:ring-2 focus:ring-primary transition"
                    placeholder="Search products, e.g. 'watch' or 'backpack'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  aria-label="Toggle theme"
                  title="Toggle theme"
                  className="p-3 rounded-xl bg-card border border-border hover:shadow-md transition"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                <button
                  aria-label="Open filters"
                  title="Filters"
                  onClick={() => setShowFilters(true)}
                  className="p-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:scale-105 transition"
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>

            {/* Carousel */}
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {featured.length > 0 ? (
                  <div className="relative h-64 sm:h-72 lg:h-80">
                    {featured.map((p, i) => {
                      const active = i === carouselIndex;
                      return (
                        <article
                          key={p.id}
                          className={`absolute inset-0 transition-opacity duration-700 ${
                            active ? "opacity-100 z-10" : "opacity-0 z-0"
                          }`}
                          aria-hidden={!active}
                        >
                          <img
                            src={p.image_url || "/placeholder.svg"}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                            <div className="text-white">
                              <h3 className="text-2xl font-bold leading-tight">
                                {p.name}
                              </h3>
                              <p className="mt-2 text-sm max-w-md line-clamp-2">
                                {p.description}
                              </p>
                              <div className="mt-3 flex items-center gap-3">
                                <span className="text-lg font-bold">₹{p.price}</span>
                                <button
                                  onClick={() => addToCartAndNotify(p.id)}
                                  className="px-3 py-2 rounded-lg bg-white text-primary font-semibold"
                                >
                                  Add to cart
                                </button>
                                <button
                                  onClick={() => toggleWishlist(p.id)}
                                  className="px-2 py-2 rounded-lg bg-white/20 text-white"
                                >
                                  {wishlist.has(p.id) ? "♥" : "♡"} Wishlist
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}

                    {/* carousel controls */}
                    <div className="absolute left-4 bottom-4 flex gap-2">
                      {featured.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCarouselIndex(i)}
                          className={`w-2 h-2 rounded-full transition ${
                            i === carouselIndex ? "bg-white" : "bg-white/40"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center rounded-2xl">
                    <div className="text-center text-muted-foreground">
                      <div className="text-2xl font-semibold">No featured items</div>
                      <div className="mt-2 text-sm">We will add some soon</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID + CONTROLS */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Controls row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="text-sm text-muted-foreground">Category</div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center overflow-x-hidden">
            <label className="text-sm text-muted-foreground">Sort</label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "price-asc" | "price-desc")
              }
              className="rounded-lg px-3 py-2 bg-secondary border border-border"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price — Low to High</option>
              <option value="price-desc">Price — High to Low</option>
            </select>

            {/* price quick filters */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ""}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                className="w-20 px-2 py-1 rounded-lg bg-secondary border border-border text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ""}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                className="w-20 px-2 py-1 rounded-lg bg-secondary border border-border text-sm"
              />
              <button
                onClick={() => { setMinPrice(null); setMaxPrice(null); }}
                className="px-3 py-1 rounded-lg bg-secondary hover:bg-muted text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        ) : (
          <>
            <ProductGrid products={paginatedProducts} isAuthenticated={isAuthenticated} />

            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-secondary disabled:opacity-50 hover:bg-muted"
                >
                  Previous
                </button>

                <div className="flex gap-2 items-center">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg ${currentPage === page ? "bg-gradient-to-r from-primary to-accent text-white" : "bg-secondary hover:bg-muted"}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-secondary disabled:opacity-50 hover:bg-muted"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Mobile / Drawer Filters */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
            aria-hidden
          />
          <aside className="relative ml-auto w-full max-w-sm bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-muted-foreground">Close</button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-lg p-2 bg-secondary border border-border">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Price range</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice ?? ""} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)} className="w-1/2 rounded-lg p-2 bg-secondary border border-border" />
                <input type="number" placeholder="Max" value={maxPrice ?? ""} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)} className="w-1/2 rounded-lg p-2 bg-secondary border border-border" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setShowFilters(false); }} className="px-4 py-2 rounded-lg bg-secondary">Apply</button>
              <button onClick={() => { setSelectedCategory("all"); setMinPrice(null); setMaxPrice(null); }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white">Reset</button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
