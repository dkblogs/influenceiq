"use client"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

interface AppContextType {
  credits: number | null
  unreadCount: number
  role: string | null
  brandVerified: boolean | null
  refreshCredits: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [credits, setCredits] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [role, setRole] = useState<string | null>(null)
  const [brandVerified, setBrandVerified] = useState<boolean | null>(null)

  const userId = (session?.user as any)?.id

  const refreshCredits = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/user-credits?userId=${userId}`)
      const data = await res.json()
      if (typeof data.credits === "number") setCredits(data.credits)
      if (data.role) setRole(data.role)
      if (data.brandVerified !== undefined) setBrandVerified(data.brandVerified)
    } catch (e) {
      console.error("[AppContext] refreshCredits error:", e)
    }
  }, [userId])

  const refreshNotifications = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount)
    } catch (e) {
      console.error("[AppContext] refreshNotifications error:", e)
    }
  }, [userId])

  // Load on auth state change
  useEffect(() => {
    if (status === "authenticated" && userId) {
      refreshCredits()
      refreshNotifications()
    }
    if (status === "unauthenticated") {
      setCredits(null)
      setUnreadCount(0)
      setRole(null)
      setBrandVerified(null)
    }
  }, [status, userId])

  // Poll notifications every 30s
  useEffect(() => {
    if (status !== "authenticated") return
    const interval = setInterval(refreshNotifications, 30000)
    return () => clearInterval(interval)
  }, [status, refreshNotifications])

  // Global event listeners
  useEffect(() => {
    function handleNotifsRead() { setUnreadCount(0) }
    window.addEventListener("credits-updated", refreshCredits)
    window.addEventListener("notifications-read", handleNotifsRead)
    return () => {
      window.removeEventListener("credits-updated", refreshCredits)
      window.removeEventListener("notifications-read", handleNotifsRead)
    }
  }, [refreshCredits])

  return (
    <AppContext.Provider value={{ credits, unreadCount, role, brandVerified, refreshCredits, refreshNotifications }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
