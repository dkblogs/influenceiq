"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const niches = ["All", "Food", "Tech", "Fitness", "Finance", "Fashion", "Travel", "Gaming"]
const platforms = ["All", "Instagram", "YouTube", "LinkedIn"]

const colorMap: Record<string, string> = {
  PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
  VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
  MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
}

function firstName(name: string) {
  return name?.split(" ")[0] || name
}

export default function Discover() {
  const { data: session, status } = useSession()
  const loggedIn = status !== "loading" && !!session

  const [influencers, setInfluencers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNiche, setSelectedNiche] = useState("All")
  const [selectedPlatform, setSelectedPlatform] = useState("All")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchInfluencers()
  }, [selectedNiche, selectedPlatform, search])

  async function fetchInfluencers() {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedNiche !== "All") params.set("niche", selectedNiche)
    if (selectedPlatform !== "All") params.set("platform", selectedPlatform)
    if (search) params.set("search", search)
    const res = await fetch(`/api/influencers?${params}`)
    const data = await res.json()
    setInfluencers(data.influencers || [])
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-semibold text-gray-900">Influence<span className="text-purple-600">IQ</span></span>
        </a>
        {loggedIn
          ? <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg">Dashboard</a>
          : <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg">Sign in</a>
        }
      </nav>

      <div className="px-4 py-6 max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Find Influencers</h1>
        <p className="text-sm text-gray-500 mb-4">Browse AI-scored influencers. Free to search and filter.</p>

        {/* Guest nudge */}
        {!loggedIn && status !== "loading" && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-purple-800">
              🔒 <strong>Sign in free</strong> to see full profiles, stats, and contact details.
            </p>
            <a href="/signup" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center whitespace-nowrap">
              Create free account
            </a>
          </div>
        )}

        {/* Search */}
        <input
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-400 mb-4"
          placeholder="Search by name, niche, or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Niche pills — horizontally scrollable */}
        <div className="mb-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Niche</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {niches.map(n => (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedNiche === n ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Platform pills — horizontally scrollable */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Platform</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedPlatform === p ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-400 mb-4">
          {loading ? "Loading..." : `${influencers.length} influencer${influencers.length !== 1 ? "s" : ""}`}
          {selectedNiche !== "All" && ` · ${selectedNiche}`}
          {selectedPlatform !== "All" && ` · ${selectedPlatform}`}
        </p>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mt-3"></div>
              </div>
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-gray-600 mb-1">No influencers found</p>
            <p className="text-sm text-gray-400">Try a different niche or platform</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {influencers.map((inf: any) => (
              <div
                key={inf.id}
                onClick={() => { window.location.href = loggedIn ? `/influencer/${inf.id}` : "/login" }}
                className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-sm transition-shadow overflow-hidden"
              >
                {loggedIn ? (
                  /* Logged-in view */
                  <div>
                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${colorMap[inf.initials] || "bg-purple-500"} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                        {inf.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-900 text-sm truncate">{inf.name}</span>
                          {inf.verified && <span className="text-blue-500 text-xs flex-shrink-0">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{inf.handle} · {inf.location}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-semibold text-purple-600">{inf.score}</p>
                        <p className="text-xs text-gray-400">AI Score</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-1 flex-wrap mb-3">
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{inf.niche}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{inf.platform}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                        {inf.followersPublic ? (
                          <p className="text-xs font-medium text-gray-900">{inf.followers}</p>
                        ) : (
                          <p className="text-xs text-gray-400">🔒 Private</p>
                        )}
                        <p className="text-xs text-gray-400">Followers</p>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs font-medium text-gray-900">{inf.engagement}</p>
                        <p className="text-xs text-gray-400">Engagement</p>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs font-medium text-gray-900">{inf.rate}</p>
                        <p className="text-xs text-gray-400">Avg. rate</p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2">
                      <a
                        href={`/influencer/${inf.id}`}
                        onClick={e => e.stopPropagation()}
                        className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                      >
                        Unlock contact — 5 cr
                      </a>
                      <button
                        onClick={e => e.stopPropagation()}
                        className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                      >
                        AI report — 3 cr
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Guest view */
                  <div>
                    {/* Top row */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full ${colorMap[inf.initials] || "bg-purple-500"} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                        {inf.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-medium text-gray-900 text-sm">{firstName(inf.name)}</span>
                          {inf.verified && <span className="text-blue-500 text-xs">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400">{inf.location}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-1 flex-wrap mb-3">
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{inf.niche}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{inf.platform}</span>
                    </div>

                    {/* Lock message */}
                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-xs text-gray-500">
                      🔒 Sign in to see stats and contact details
                    </div>

                    {/* Button */}
                    <a
                      href="/login"
                      onClick={e => e.stopPropagation()}
                      className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium"
                    >
                      Sign in to view
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
