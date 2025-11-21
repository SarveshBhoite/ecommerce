"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/store";
import Link from "next/link";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    phoneNumber: "",
    paymentMethod: "credit-card",
  });

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // SHOW TOAST
  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 🔥 Load Cart From MongoDB Instead of Local Storage
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadCart = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Cart Load Error:", data);
          return;
        }

        // Map DB cart items into UI format
        const items = data.items.map((entry: any) => ({
          id: entry.product.id,
          name: entry.product.name,
          price: entry.product.price,
          cartQuantity: entry.quantity,
        }));

        setCartItems(items);

        if (user?.email) {
          setFormData((prev) => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        console.error("Failed to load cart:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, router, user]);

  // INPUT HANDLER
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // TOTAL PRICE
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  // PLACE ORDER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          totalPrice,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.cartQuantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Order Failed");
      }

      // ✅ CLEAR CART IN MONGODB
      await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      window.dispatchEvent(new Event("cart-updated"));


      setOrderPlaced(true);
      showToastMessage("Order placed successfully!");
    } catch (error) {
      console.error("Order Error:", error);
      showToastMessage("Failed to place order. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================
  //      UI STARTS BELOW
  // ==========================

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Please log in to checkout</p>
        </div>
      </main>
    );
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
    );
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
              Thank you for your purchase. Your order is now being processed.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 🔥 MAIN CHECKOUT PAGE
  return (
    <main>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                  required
                />
              </div>

              {/* Payment */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
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
                    <span className="font-medium">
                      ₹{(item.price * item.cartQuantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
