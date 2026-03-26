"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

export default function Admin() {
  const { status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState<any[]>([])
  const [influencers, setInfluencers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInfluencers: 0,
    totalCampaigns: 0,
    totalCreditsSpent: 0,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      fetchAllData()
    }
  }, [status])

  async function fetchAllData() {
    setLoading(true)
    try {
      const [usersRes, influencersRes, transactionsRes, campaignsRes, messagesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/influencers"),
        fetch("/api/admin/transactions"),
        fetch("/api/admin/campaigns"),
        fetch("/api/admin/messages"),
      ])

      const usersData = await usersRes.json()
      const influencersData = await influencersRes.json()
      const transactionsData = await transactionsRes.json()
      const campaignsData = await campaignsRes.json()
      const messagesData = await messagesRes.json()

      setUsers(usersData.users || [])
      setInfluencers(influencersData.influencers || [])
      setTransactions(transactionsData.transactions || [])
      setCampaigns(campaignsData.campaigns || [])
      setMessages(messagesData.messages || [])

      const creditsSpent = (transactionsData.transactions || [])
        .filter((t: any) => t.amount < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalInfluencers: influencersData.influencers?.length || 0,
        totalCampaigns: campaignsData.campaigns?.length || 0,
        totalCreditsSpent: creditsSpent,
      })
    } catch (error) {
      console.error("Admin fetch error:", error)
    }
    setLoading(false)
  }

  async function verifyBrand(id: string, current: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, brandVerified: !current }),
    })
    fetchAllData()
  }

  async function toggleVerified(id: string, current: boolean) {
    await fetch("/api/admin/influencers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, verified: !current }),
    })
    fetchAllData()
  }

  async function deleteInfluencer(id: string) {
    if (!confirm("Delete this influencer?")) return
    await fetch("/api/admin/influencers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchAllData()
  }

  async function markMessageRead(id: string) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "read" }),
    })
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: "read" } : m))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#64748B] text-sm">Loading admin panel...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Admin Panel</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Manage your InfluenceIQ platform</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#12121A] rounded-2xl p-5 border border-[#1E1E2E]">
            <div className="text-sm text-[#94A3B8] mb-1">Total users</div>
            <div className="text-2xl font-bold text-[#F8FAFC]">{stats.totalUsers}</div>
          </div>
          <div className="bg-[#12121A] rounded-2xl p-5 border border-[#1E1E2E]">
            <div className="text-sm text-[#94A3B8] mb-1">Influencers listed</div>
            <div className="text-2xl font-bold text-purple-400">{stats.totalInfluencers}</div>
          </div>
          <div className="bg-[#12121A] rounded-2xl p-5 border border-[#1E1E2E]">
            <div className="text-sm text-[#94A3B8] mb-1">Campaigns posted</div>
            <div className="text-2xl font-bold text-[#F8FAFC]">{stats.totalCampaigns}</div>
          </div>
          <div className="bg-[#12121A] rounded-2xl p-5 border border-[#1E1E2E]">
            <div className="text-sm text-[#94A3B8] mb-1">Credits spent</div>
            <div className="text-2xl font-bold text-orange-400">{stats.totalCreditsSpent}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[#1E1E2E]">
          {["overview", "users", "influencers", "campaigns", "transactions", "messages"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 mb-[-1px] transition-colors ${activeTab === tab ? "border-purple-500 text-purple-400" : "border-transparent text-[#64748B] hover:text-[#94A3B8]"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              <h2 className="font-medium text-[#F8FAFC] mb-4">Recent users</h2>
              <div className="space-y-3">
                {users.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#F8FAFC]">{u.name || "No name"}</div>
                      <div className="text-xs text-[#64748B]">{u.email} · {u.role}</div>
                    </div>
                    <div className="text-sm font-medium text-purple-400">{u.credits} cr</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              <h2 className="font-medium text-[#F8FAFC] mb-4">Recent transactions</h2>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#F8FAFC]">{t.type}</div>
                      <div className="text-xs text-[#64748B]">{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</div>
                    </div>
                    <div className={`text-sm font-medium ${t.amount > 0 ? "text-[#10B981]" : "text-red-400"}`}>
                      {t.amount > 0 ? "+" : ""}{t.amount} cr
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-[#1E1E2E] bg-[#0D0D1A]">
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Email</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Role</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Credits</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Joined</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any, i: number) => (
                  <tr key={u.id} className={`border-b border-[#1E1E2E] ${i % 2 === 0 ? "bg-[#12121A]" : "bg-[#0D0D1A]"}`}>
                    <td className="px-6 py-3 font-medium text-[#F8FAFC]">{u.name || "—"}</td>
                    <td className="px-6 py-3 text-[#94A3B8]">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "brand" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-purple-400">{u.credits}</td>
                    <td className="px-6 py-3 text-[#64748B]">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</td>
                    <td className="px-6 py-3">
                      {u.role === "brand" && (
                        <button
                          onClick={() => verifyBrand(u.id, u.brandVerified)}
                          className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${u.brandVerified ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E] hover:border-blue-500/30 hover:text-blue-400"}`}
                        >
                          {u.brandVerified ? "✓ Verified" : "Verify"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "influencers" && (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-[#1E1E2E] bg-[#0D0D1A]">
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Niche</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Platform</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Score</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Verified</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((inf: any, i: number) => (
                  <tr key={inf.id} className={`border-b border-[#1E1E2E] ${i % 2 === 0 ? "bg-[#12121A]" : "bg-[#0D0D1A]"}`}>
                    <td className="px-6 py-3">
                      <div className="font-medium text-[#F8FAFC]">{inf.name}</div>
                      <div className="text-xs text-[#64748B]">{inf.handle}</div>
                    </td>
                    <td className="px-6 py-3 text-[#94A3B8]">{inf.niche}</td>
                    <td className="px-6 py-3 text-[#94A3B8]">{inf.platform}</td>
                    <td className="px-6 py-3 font-medium text-purple-400">{inf.score}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => toggleVerified(inf.id, inf.verified)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${inf.verified ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" : "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]"}`}
                      >
                        {inf.verified ? "✓ Verified" : "Unverified"}
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => deleteInfluencer(inf.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-[#1E1E2E] bg-[#0D0D1A]">
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Title</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Niche</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Budget</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Slots</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Posted</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c: any, i: number) => (
                  <tr key={c.id} className={`border-b border-[#1E1E2E] ${i % 2 === 0 ? "bg-[#12121A]" : "bg-[#0D0D1A]"}`}>
                    <td className="px-6 py-3 font-medium text-[#F8FAFC] max-w-xs truncate">{c.title}</td>
                    <td className="px-6 py-3 text-[#94A3B8]">{c.niche}</td>
                    <td className="px-6 py-3 text-[#94A3B8]">{c.budget}</td>
                    <td className="px-6 py-3 text-[#94A3B8]">{c.slots}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/20">{c.status}</span>
                    </td>
                    <td className="px-6 py-3 text-[#64748B]">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] overflow-x-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] text-sm">No messages yet.</div>
            ) : (
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1E1E2E] bg-[#0D0D1A]">
                    <th className="text-left px-6 py-3 font-medium text-[#64748B]">From</th>
                    <th className="text-left px-6 py-3 font-medium text-[#64748B]">Subject</th>
                    <th className="text-left px-6 py-3 font-medium text-[#64748B]">Preview</th>
                    <th className="text-left px-6 py-3 font-medium text-[#64748B]">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-[#64748B]">Date</th>
                    <th className="text-left px-6 py-3 font-medium text-[#64748B]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m: any, i: number) => (
                    <tr key={m.id} className={`border-b border-[#1E1E2E] ${i % 2 === 0 ? "bg-[#12121A]" : "bg-[#0D0D1A]"} ${m.status === "unread" ? "border-l-2 border-l-purple-500" : ""}`}>
                      <td className="px-6 py-3">
                        <div className="font-medium text-[#F8FAFC] text-sm">{m.name}</div>
                        <div className="text-xs text-[#64748B]">{m.email}</div>
                        {m.userId && (
                          <button
                            onClick={() => setActiveTab("users")}
                            className="text-xs text-purple-400 hover:underline mt-0.5"
                          >
                            View user →
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-3 text-[#94A3B8] max-w-[160px] truncate">{m.subject}</td>
                      <td className="px-6 py-3 text-[#64748B] max-w-[200px] truncate text-xs">{m.message}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${m.status === "unread" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[#64748B] text-xs whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</td>
                      <td className="px-6 py-3">
                        {m.status === "unread" && (
                          <button
                            onClick={() => markMessageRead(m.id)}
                            className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                          >
                            Mark read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-[#1E1E2E] bg-[#0D0D1A]">
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Type</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Amount</th>
                  <th className="text-left px-6 py-3 font-medium text-[#64748B]">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any, i: number) => (
                  <tr key={t.id} className={`border-b border-[#1E1E2E] ${i % 2 === 0 ? "bg-[#12121A]" : "bg-[#0D0D1A]"}`}>
                    <td className="px-6 py-3 font-medium text-[#F8FAFC]">{t.type}</td>
                    <td className={`px-6 py-3 font-medium ${t.amount > 0 ? "text-[#10B981]" : "text-red-400"}`}>
                      {t.amount > 0 ? "+" : ""}{t.amount} credits
                    </td>
                    <td className="px-6 py-3 text-[#64748B]">{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  )
}
