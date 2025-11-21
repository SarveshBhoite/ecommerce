"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/store";
import { getCart, updateCartQuantity, removeFromCart } from "@/lib/db";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const isAuthenticated = useAuth((state) => state.isAuthenticated());
  const router = useRouter();

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadCart = async () => {
      try {
        const cart = await getCart();
        const items: CartItem[] = [];

        for (const [productId, quantity] of Object.entries(cart)) {
          const response = await fetch(`/api/products/${productId}`);
          const product = await response.json();

          items.push({
            productId,
            quantity: quantity as number,
            product: {
              id: product._id || product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
            },
          });
        }

        setCartItems(items);
      } catch (err) {
        console.error("Cart load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, router]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveItem(productId);

    const success = await updateCartQuantity(productId, newQuantity);
    if (success) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      window.dispatchEvent(new Event("cart-updated"));
      showToastMessage("Quantity updated");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const success = await removeFromCart(productId);
    if (success) {
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
      window.dispatchEvent(new Event("cart-updated"));
      showToastMessage("Item removed");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading your cart...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingBag size={30} className="text-primary drop-shadow-md" />
          <h1 className="text-4xl font-extrabold tracking-tight">Your Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={68} className="mx-auto text-muted-foreground mb-4 opacity-25" />
            <h2 className="text-3xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Start adding premium products to your cart.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95"
            >
              Browse Products
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* ====================== */}
            {/* Cart Items */}
            {/* ====================== */}
            <div className="lg:col-span-2 space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-card rounded-2xl p-5 border border-border/40 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex gap-5 items-start"
                >
                  {/* Product Image */}
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-28 h-28 rounded-xl object-cover shadow-md hover:scale-105 transition-transform duration-300"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xl mb-1 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-primary font-bold mb-4 text-lg">
                      ₹{item.product.price.toLocaleString("en-IN")}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-secondary rounded-xl p-2 w-fit">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantity - 1)
                        }
                        className="p-2 hover:bg-muted rounded-full transition hover:scale-110"
                      >
                        <Minus size={18} />
                      </button>

                      <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>

                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantity + 1)
                        }
                        className="p-2 hover:bg-muted rounded-full transition hover:scale-110"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Item Total + Remove */}
                  <div className="text-right min-w-[100px]">
                    <p className="text-sm text-muted-foreground mb-2">Total</p>
                    <p className="text-xl font-extrabold mb-3">
                      ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                    </p>

                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 hover:scale-110 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ====================== */}
            {/* Summary Card */}
            {/* ====================== */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 shadow-lg border border-border/40 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span>₹{tax.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold">Total</h3>
                <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/"
                  className="w-full block text-center py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/10 transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 font-medium">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
