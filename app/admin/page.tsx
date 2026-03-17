"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Admin() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState([])
  const [influencers, setInfluencers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [campaigns, setCampaigns] = useState([])
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
      const [usersRes, influencersRes, transactionsRes, campaignsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/influencers"),
        fetch("/api/admin/transactions"),
        fetch("/api/admin/campaigns"),
      ])

      const usersData = await usersRes.json()
      const influencersData = await influencersRes.json()
      const transactionsData = await transactionsRes.json()
      const campaignsData = await campaignsRes.json()

      setUsers(usersData.users || [])
      setInfluencers(influencersData.influencers || [])
      setTransactions(transactionsData.transactions || [])
      setCampaigns(campaignsData.campaigns || [])

      const creditsSpent = (transactionsData.transactions || [])
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

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

  async function toggleVerified(id, current) {
    await fetch("/api/admin/influencers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, verified: !current }),
    })
    fetchAllData()
  }

  async function deleteInfluencer(id) {
    if (!confirm("Delete this influencer?")) return
    await fetch("/api/admin/influencers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchAllData()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading admin panel...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navigation */}
      <nav className="bg-white flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
          </a>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-500">{session?.user?.email}</span>
          <a href="/dashboard" className="text-sm text-purple-600 hover:underline">Dashboard →</a>
        </div>
      </nav>

      <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">

        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your InfluenceIQ platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total users</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Influencers listed</div>
            <div className="text-2xl font-semibold text-purple-600">{stats.totalInfluencers}</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Campaigns posted</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.totalCampaigns}</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Credits spent</div>
            <div className="text-2xl font-semibold text-orange-500">{stats.totalCreditsSpent}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-100 overflow-x-auto">
          {["overview", "users", "influencers", "campaigns", "transactions"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-2 text-sm font-medium capitalize border-b-2 mb-[-1px] transition-colors whitespace-nowrap ${activeTab === tab ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Recent users</h2>
              <div className="space-y-3">
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{u.name || "No name"}</div>
                      <div className="text-xs text-gray-400 truncate">{u.email} · {u.role}</div>
                    </div>
                    <div className="text-sm font-medium text-purple-600 ml-3 flex-shrink-0">{u.credits} cr</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Recent transactions</h2>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t.type}</div>
                      <div className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className={`text-sm font-medium ml-3 flex-shrink-0 ${t.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                      {t.amount > 0 ? "+" : ""}{t.amount} cr
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Role</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Credits</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 md:px-6 py-3 font-medium text-gray-900">{u.name || "—"}</td>
                      <td className="px-4 md:px-6 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 md:px-6 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "brand" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 font-medium text-purple-600">{u.credits}</td>
                      <td className="px-4 md:px-6 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Influencers */}
        {activeTab === "influencers" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Niche</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Platform</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Score</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Verified</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {influencers.map((inf, i) => (
                    <tr key={inf.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 md:px-6 py-3">
                        <div className="font-medium text-gray-900">{inf.name}</div>
                        <div className="text-xs text-gray-400">{inf.handle}</div>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-500">{inf.niche}</td>
                      <td className="px-4 md:px-6 py-3 text-gray-500">{inf.platform}</td>
                      <td className="px-4 md:px-6 py-3 font-medium text-purple-600">{inf.score}</td>
                      <td className="px-4 md:px-6 py-3">
                        <button
                          onClick={() => toggleVerified(inf.id, inf.verified)}
                          className={`text-xs px-2 py-0.5 rounded-full ${inf.verified ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}
                        >
                          {inf.verified ? "✓ Verified" : "Unverified"}
                        </button>
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <button
                          onClick={() => deleteInfluencer(inf.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campaigns */}
        {activeTab === "campaigns" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Title</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Niche</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Budget</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Slots</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 md:px-6 py-3 font-medium text-gray-900 max-w-xs truncate">{c.title}</td>
                      <td className="px-4 md:px-6 py-3 text-gray-500">{c.niche}</td>
                      <td className="px-4 md:px-6 py-3 text-gray-500">{c.budget}</td>
                      <td className="px-4 md:px-6 py-3 text-gray-500">{c.slots}</td>
                      <td className="px-4 md:px-6 py-3">
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">{c.status}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions */}
        {activeTab === "transactions" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[300px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Amount</th>
                    <th className="text-left px-4 md:px-6 py-3 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 md:px-6 py-3 font-medium text-gray-900">{t.type}</td>
                      <td className={`px-4 md:px-6 py-3 font-medium ${t.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                        {t.amount > 0 ? "+" : ""}{t.amount} credits
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
