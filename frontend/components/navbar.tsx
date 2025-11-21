"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import {
  ShoppingCart,
  LogOut,
  Home,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

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
      console.error("Cart count error:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) fetchCartCount();

    const handler = () => fetchCartCount();
    window.addEventListener("cart-updated", handler);

    return () => window.removeEventListener("cart-updated", handler);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="
      sticky top-0 z-50 
      bg-white/60 dark:bg-black/40 
      backdrop-blur-xl 
      border-b border-border/40 
      shadow-md
    ">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 select-none">
          <div className="
            w-10 h-10 rounded-xl 
            bg-gradient-to-br from-primary to-accent 
            flex items-center justify-center shadow-lg
          ">
            <span className="text-white font-bold text-sm">SH</span>
          </div>

          <span className="
            text-2xl font-extrabold
            bg-gradient-to-r from-primary to-accent 
            bg-clip-text text-transparent
            transition-all duration-300 
            group-hover:scale-110
          ">
            ShopHub
          </span>
        </Link>

        {/* Right Buttons */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* NOT LOGGED IN — LOGIN & REGISTER */}
          {!isAuthenticated() && (
            <>
              <Link
                href="/login"
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full
                  border border-border bg-card/60 backdrop-blur
                  hover:border-primary hover:text-primary 
                  transition-all duration-200 hover:scale-105
                "
              >
                <LogIn size={18} />
                <span className="hidden sm:inline font-medium">Login</span>
              </Link>

              <Link
                href="/register"
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full 
                  bg-gradient-to-r from-primary to-accent text-white 
                  shadow-md hover:shadow-xl 
                  transition-all duration-200 hover:scale-105
                "
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline font-medium">Register</span>
              </Link>
            </>
          )}

          {/* LOGGED IN */}
          {isAuthenticated() && (
            <>
              <Link
                href="/"
                className="
                  flex items-center gap-2 px-3 py-2 rounded-full
                  hover:bg-primary/10 hover:text-primary 
                  transition-all duration-200 hover:scale-105
                "
              >
                <Home size={20} />
                <span className="hidden sm:inline font-medium">Browse</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="
                  relative flex items-center
                  hover:text-primary hover:scale-110 
                  transition-all duration-200
                "
              >
                <ShoppingCart size={26} className="transition-transform" />

                {cartCount > 0 && (
                  <span
                    className="
                      absolute -top-2.5 -right-3 
                      bg-gradient-to-r from-primary to-accent 
                      text-white text-xs font-bold 
                      rounded-full w-6 h-6 flex items-center justify-center
                      shadow-md animate-bounce
                    "
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full
                  bg-gradient-to-r from-destructive to-red-500 
                  text-white font-medium 
                  shadow-md hover:shadow-xl
                  transition-all duration-200 hover:scale-105
                "
              >
                <LogOut size={18} />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
