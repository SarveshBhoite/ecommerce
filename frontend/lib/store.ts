import { create } from "zustand"

interface AuthState {
  token: string | null
  user: { id: string; email: string } | null
  setAuth: (token: string, user: { id: string; email: string }) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user: null,
  setAuth: (token, user) => {
    set({ token, user })
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
    }
  },
  logout: () => {
    set({ token: null, user: null })
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },
  isAuthenticated: () => get().token !== null,
}))
