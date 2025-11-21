"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface Props {
  products: Product[];
  isAuthenticated: boolean;
}

export function ProductGrid({ products, isAuthenticated }: Props) {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ✅ NEW — Add To Cart using MongoDB API
  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToastMessage("Please log in first");
      setTimeout(() => router.push("/login"), 500);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      if (!response.ok) {
        console.error("Cart Error:", await response.json());
        showToastMessage("Failed to add item.");
        return;
      }

      // 🔥 Update navbar cart badge
      window.dispatchEvent(new Event("cart-updated"));

      showToastMessage(`Added ${product.name} to cart`);
    } catch (err) {
      console.error("Add Cart Error:", err);
      showToastMessage("Something went wrong.");
    }
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, idx) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <div
              className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col hover:scale-105 transform animate-in fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Image Container */}
              <div className="relative w-full h-64 bg-secondary overflow-hidden group">
                <img
                  src={product.image_url || "/classicwatch.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <button
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <Heart
                    size={20}
                    className={`transition-all ${
                      wishlist.has(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

                {/* Category Badge */}
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full backdrop-blur">
                  {product.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {product.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-110 transition-all duration-200 font-semibold flex items-center gap-2 group active:scale-95"
                  >
                    <ShoppingCart
                      size={18}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 font-medium flex items-center gap-2">
          <ShoppingCart size={18} />
          {toastMessage}
        </div>
      )}
    </>
  );
}
