"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import { ShoppingCart, LogOut, Home, LogIn, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  // 🔥 Fetch cart count from MongoDB
  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        const totalItems = data.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        );
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error("Failed to load cart count:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCartCount();
    }

    // Listen for global cart updates
    const handler = () => fetchCartCount();
    window.addEventListener("cart-updated", handler);

    return () => window.removeEventListener("cart-updated", handler);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">SH</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform">
            ShopHub
          </span>
        </Link>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-6">
          {/* 🚫 NOT LOGGED IN — Show Login & Register */}
          {!isAuthenticated() && (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground border border-border hover:bg-primary/10 hover:text-primary transition-all font-medium"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline">Register</span>
              </Link>
            </>
          )}

          {/* ✅ LOGGED IN — Show Browse, Cart, Logout */}
          {isAuthenticated() && (
            <>
              <Link
                href="/"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-all duration-200 hover:scale-105"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Browse</span>
              </Link>

              <Link
                href="/cart"
                className="relative text-foreground hover:text-primary transition-all duration-200 hover:scale-110 group"
              >
                <ShoppingCart
                  size={24}
                  className="group-hover:rotate-12 transition-transform"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-destructive to-red-500 text-destructive-foreground hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
