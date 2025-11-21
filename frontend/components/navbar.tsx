"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/store"
import { ShoppingCart, LogOut, Home } from "lucide-react"
import { useState, useEffect } from "react"
import { getCart } from "@/lib/db"

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const cart = getCart()
    setCartCount(Object.values(cart).reduce((a, b) => a + b, 0))

    const handleStorageChange = () => {
      const updatedCart = getCart()
      setCartCount(Object.values(updatedCart).reduce((a, b) => a + b, 0))
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">SH</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform">
            ShopHub
          </span>
        </Link>

        <div className="flex items-center gap-6">
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
                <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-destructive to-red-500 text-destructive-foreground hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
