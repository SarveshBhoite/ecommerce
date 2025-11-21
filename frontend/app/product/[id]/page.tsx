"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/store";
import { addToCart } from "@/lib/db";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const isAuthenticated = useAuth((state) => state.isAuthenticated());
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToastMessage("Please log in first");
      setTimeout(() => router.push("/login"), 500);
      return;
    }

    if (product) {
      addToCart(product.id);
      window.dispatchEvent(new Event("cart-updated"));
      showToastMessage(`${product.name} added to cart`);
    }
  };

  const toggleWishlist = () => {
    setWishlisted((prev) => !prev);
    showToastMessage(
      !wishlisted ? "Added to wishlist ❤️" : "Removed from wishlist"
    );
  };

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-slate-900 min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* ========================== */}
          {/* PRODUCT IMAGE */}
          {/* ========================== */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-secondary/40 backdrop-blur-xl h-96 md:h-[600px] group">
            <img
              src={product.image_url || "/classicwatch.jpg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Wishlist */}
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-lg hover:scale-110 transition-all"
            >
              <Heart
                size={22}
                className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}
              />
            </button>
          </div>

          {/* ========================== */}
          {/* PRODUCT DETAILS */}
          {/* ========================== */}
          <div className="flex flex-col justify-between">
            {/* Category */}
            <div>
              <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary mb-4">
                {product.category}
              </span>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                {product.name}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Price */}
              <div className="mb-10">
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full py-3 rounded-xl bg-secondary/80 dark:bg-secondary/50 hover:bg-muted transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 font-medium">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
