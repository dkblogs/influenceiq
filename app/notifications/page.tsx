"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })
}

const TYPE_ICON: Record<string, string> = {
  application_received: "📬",
  application_accepted: "🎉",
  application_rejected: "📋",
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => setNotifications(d.notifications || []))
      .finally(() => setLoading(false))

    // Mark all as read and clear the navbar bell badge
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    }).then(() => {
      window.dispatchEvent(new Event("notifications-read"))
    }).catch(() => {})
  }, [status, router])

  async function handleClick(notif: any) {
    if (!notif.read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      })
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    }
    if (notif.link) router.push(notif.link)
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-12">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-[#64748B] mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-purple-400 text-sm gap-3">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔔</div>
            <div className="text-[#F8FAFC] font-medium mb-2">No notifications yet</div>
            <div className="text-sm text-[#64748B]">You&apos;ll be notified about campaign applications and updates here.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left flex items-start gap-4 px-4 py-4 rounded-2xl border transition-all hover:border-purple-500/30 ${
                  notif.read
                    ? "bg-[#12121A] border-[#1E1E2E]"
                    : "bg-[#12121A] border-purple-500/20 shadow-sm shadow-purple-500/5"
                }`}
              >
                <div className="text-2xl flex-shrink-0 mt-0.5">
                  {TYPE_ICON[notif.type] ?? "🔔"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${notif.read ? "text-[#94A3B8]" : "text-[#F8FAFC]"}`}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-[#4A5568] mt-1.5">{timeAgo(notif.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
