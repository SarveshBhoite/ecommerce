"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/store"
import { Lock, Mail, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const router = useRouter()
  const setAuth = useAuth((state) => state.setAuth)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(""), 3000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Login failed")
        showToast(data.message || "Login failed")
        return
      }

      setAuth(data.token, { id: data.userId, email })
      showToast("Login successful!")
      setTimeout(() => router.push("/"), 500)
    } catch (err) {
      const message = "An error occurred. Please try again."
      setError(message)
      showToast(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-balance">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your account</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 border border-border/50 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Email Address</label>
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder-muted-foreground border-2 border-transparent focus:border-primary focus:outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Password</label>
              <div className="relative group">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder-muted-foreground border-2 border-transparent focus:border-primary focus:outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/register"
            className="w-full block text-center py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-all duration-200 hover:scale-105"
          >
            Create Account
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 font-medium">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
