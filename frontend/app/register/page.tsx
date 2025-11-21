"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/store";
import { UserPlus, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();
  const setAuth = useAuth((state) => state.setAuth);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      showToast("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      showToast("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        showToast(data.message || "Registration failed");
        return;
      }

      setAuth(data.token, { id: data.userId, email });
      showToast("Registration successful!");
      setTimeout(() => router.push("/"), 500);
    } catch (err) {
      const msg = "An error occurred. Please try again.";
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="backdrop-blur-xl bg-card/70 border border-white/10 rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom-4 fade-in duration-500">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
              <UserPlus size={32} className="text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground mt-1">Join our community</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/70 backdrop-blur border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/70 backdrop-blur border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/70 backdrop-blur border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive/40 text-destructive px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8 gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">Already have an account?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login Redirect */}
          <Link
            href="/login"
            className="w-full block text-center py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10 hover:shadow-md transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 font-medium">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
