"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/lib/store"
import { getCart, updateCartQuantity, removeFromCart } from "@/lib/db"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
}

interface CartItem {
  productId: string
  quantity: number
  product: Product
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const isAuthenticated = useAuth((state) => state.isAuthenticated())
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadCart = async () => {
      try {
        const cart = getCart()
        const items: CartItem[] = []

        for (const [productId, quantity] of Object.entries(cart)) {
          const response = await fetch(`/api/products/${productId}`)
          const product = await response.json()
          items.push({ productId, quantity: quantity as number, product })
        }

        setCartItems(items)
      } catch (error) {
        console.error("Failed to load cart:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [isAuthenticated, router])

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId)
      return
    }

    updateCartQuantity(productId, newQuantity)
    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: newQuantity } : item)),
    )
    showToastMessage("Quantity updated")
  }

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
    showToastMessage("Item removed from cart")
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + tax

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading your cart...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag size={28} className="text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
            >
              Continue Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-card rounded-xl p-4 sm:p-6 flex gap-4 items-start border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                >
                  {/* Product Image */}
                  <img
                    src={item.product.image_url || "/classicwatch.jpg"}
                    alt={item.product.name}
                    className="w-24 h-24 rounded-lg object-cover bg-secondary flex-shrink-0 hover:scale-110 transition-transform duration-300"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-2 truncate">{item.product.name}</h3>
                    <p className="text-primary font-bold mb-3">₹{item.product.price.toLocaleString("en-IN")}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-secondary rounded-lg p-1 w-fit">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-muted rounded transition-colors hover:scale-110"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-muted rounded transition-colors hover:scale-110"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Total Price & Remove */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-muted-foreground mb-3">Total</p>
                    <p className="text-xl font-bold mb-3">
                      ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border border-border/50 sticky top-24">
                <h2 className="font-bold text-lg mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST 18%)</span>
                    <span className="font-semibold">₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/"
                  className="w-full mt-3 text-center py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition-all duration-200 font-semibold"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 font-medium">
          {toastMessage}
        </div>
      )}
    </main>
  )
}
