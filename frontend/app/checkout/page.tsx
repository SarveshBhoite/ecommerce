"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/store";
import Link from "next/link";
import { CreditCard, CheckCircle2 } from "lucide-react";

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

  // Toast Handler
  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Load cart from MongoDB
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

        if (!response.ok) return;

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
        console.error("Cart Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, router, user]);

  // Form input handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  // Place order
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

      if (!response.ok) throw new Error("Order failed");

      // Clear cart DB
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      window.dispatchEvent(new Event("cart-updated"));

      setOrderPlaced(true);
      showToastMessage("Order placed successfully!");
    } catch (err) {
      console.error(err);
      showToastMessage("Order failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen text-muted-foreground">
          Loading checkout...
        </div>
      </main>
    );
  }

  // Unauthorized
  if (!isAuthenticated) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen text-muted-foreground">
          Please log in to checkout.
        </div>
      </main>
    );
  }

  // Cart empty
  if (cartItems.length === 0) {
    return (
      <main>
        <Navbar />
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:scale-105 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // Order success screen
  if (orderPlaced) {
    return (
      <main>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-card p-12 rounded-2xl border border-primary shadow-xl">
            <CheckCircle2 size={80} className="text-primary mx-auto mb-6" />

            <h1 className="text-4xl font-extrabold mb-4">
              Order Placed Successfully!
            </h1>

            <p className="text-muted-foreground mb-8 text-lg">
              Thank you for shopping with us. Your order is being processed.
            </p>

            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:scale-105 transition font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------
  // MAIN CHECKOUT PAGE UI
  // ---------------------------
  return (
    <main className="bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-slate-900 min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-10 tracking-tight">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* FORM */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-8 shadow-xl border border-border/50 backdrop-blur"
            >
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="font-medium mb-2 block">Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl bg-secondary border border-border/50"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-medium mb-2 block">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl bg-secondary border border-border/50"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="font-medium mb-2 block">Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl bg-secondary border border-border/50"
                    placeholder="123 Main St"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-medium mb-2 block">
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl bg-secondary border border-border/50"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="font-medium mb-2 block">
                    Payment Method
                  </label>
                  <div className="relative">
                    <CreditCard
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-xl bg-secondary border border-border/50"
                    >
                      <option value="credit-card">Credit Card</option>
                      <option value="debit-card">Debit Card</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <button
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:scale-105 transition disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-card rounded-2xl p-6 shadow-xl border border-border/50 sticky top-32 h-fit backdrop-blur">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm border-b border-border/40 pb-2"
                >
                  <span className="text-muted-foreground">
                    {item.name} x{item.cartQuantity}
                  </span>
                  <span className="font-medium">
                    ₹{(item.price * item.cartQuantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary text-2xl font-extrabold">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-xl">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
