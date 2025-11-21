"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/lib/store"
import { getCart } from "@/lib/db"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
}

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    phoneNumber: "",
    paymentMethod: "credit-card",
  })
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadCart = async () => {
      try {
        const cart = getCart()
        const items: any[] = []
        let total = 0

        for (const [productId, quantity] of Object.entries(cart)) {
          const response = await fetch(`/api/products/${productId}`)
          const product = await response.json()
          items.push({ ...product, cartQuantity: quantity })
          total += product.price * (quantity as number)
        }

        setCartItems(items)
        if (user?.email) {
          setFormData((prev) => ({ ...prev, email: user.email }))
        }
      } catch (error) {
        console.error("Failed to load cart:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [isAuthenticated, router, user])

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalPrice,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.cartQuantity,
            price: item.price,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to place order")
      }

      // Clear cart
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart")
      }

      setOrderPlaced(true)
      showToastMessage("Order placed successfully!")
    } catch (error) {
      console.error("Error placing order:", error)
      showToastMessage("Failed to place order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Please log in to checkout</p>
        </div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main>
        <Navbar />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  if (orderPlaced) {
    return (
      <main>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-card rounded-xl p-12 border-2 border-primary">
            <div className="mb-6 text-6xl">✓</div>
            <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Order confirmation has been sent to <span className="font-medium">{formData.email}</span>
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State 12345"
                  className="w-full px-4 py-2 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card rounded-xl p-6 border border-border sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x{item.cartQuantity}
                    </span>
                    <span className="font-medium">${(item.price * item.cartQuantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}
    </main>
  )
}
