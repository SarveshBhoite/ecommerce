"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/store";
import { Lock, Mail, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();
  const setAuth = useAuth((state) => state.setAuth);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        showToast(data.message || "Login failed");
        return;
      }

      setAuth(data.token, { id: data.userId, email });
      showToast("Login successful!");
      setTimeout(() => router.push("/"), 500);
    } catch (err) {
      const message = "An error occurred. Please try again.";
      setError(message);
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-card/70 border border-white/10 shadow-2xl rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mt-1">
              Sign in to continue shopping
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/70 backdrop-blur border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all text-base"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/70 backdrop-blur border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all text-base"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/20 border border-destructive/40 text-destructive px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold tracking-wide shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8 gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">New here?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Register Button */}
          <Link
            href="/register"
            className="w-full block text-center py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10 hover:shadow-md transition-all"
          >
            Create an Account
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
