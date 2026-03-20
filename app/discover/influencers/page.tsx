"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Navbar from "@/app/components/Navbar"

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

export default function DiscoverInfluencers() {
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
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 py-6 max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC] mb-1">Find Influencers</h1>
        <p className="text-sm text-[#94A3B8] mb-4">Browse AI-scored influencers. Free to search and filter.</p>

        {/* Guest nudge */}
        {!loggedIn && status !== "loading" && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-purple-300">
              🔒 <strong>Sign in free</strong> to see full profiles, stats, and contact details.
            </p>
            <a href="/signup" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center whitespace-nowrap hover:bg-purple-500 transition-colors">
              Create free account
            </a>
          </div>
        )}

        {/* Search */}
        <input
          className="w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#12121A] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 mb-4"
          placeholder="Search by name, niche, or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Niche pills */}
        <div className="mb-3">
          <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">Niche</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {niches.map(n => (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedNiche === n ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Platform pills */}
        <div className="mb-5">
          <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">Platform</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedPlatform === p ? "bg-[#F8FAFC] text-[#0A0A0F]" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-[#64748B] mb-4">
          {loading ? "Loading..." : `${influencers.length} influencer${influencers.length !== 1 ? "s" : ""}`}
          {selectedNiche !== "All" && ` · ${selectedNiche}`}
          {selectedPlatform !== "All" && ` · ${selectedPlatform}`}
        </p>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E1E2E] flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-[#1E1E2E] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[#1E1E2E] rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-[#1E1E2E] rounded mb-2"></div>
                <div className="h-8 bg-[#1E1E2E] rounded mt-3"></div>
              </div>
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-[#94A3B8] mb-1">No influencers found</p>
            <p className="text-sm text-[#64748B]">Try a different niche or platform</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {influencers.map((inf: any) => (
              <div
                key={inf.id}
                onClick={() => { window.location.href = `/influencer/${inf.id}` }}
                className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all overflow-hidden"
              >
                {loggedIn ? (
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${colorMap[inf.initials] || "bg-purple-500"} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                        {inf.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-[#F8FAFC] text-sm truncate">{inf.name}</span>
                          {inf.verified && <span className="bg-cyan-500/10 text-cyan-400 text-xs px-1.5 py-0.5 rounded-full font-semibold border border-cyan-500/20 flex-shrink-0">✓ Verified</span>}
                        </div>
                        <p className="text-xs text-[#64748B] truncate">
                          <span className="blur-sm select-none">••••••••</span> · {inf.location}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-semibold text-purple-400">{inf.score}</p>
                        <p className="text-xs text-[#64748B]">AI Score</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{inf.niche}</span>
                      <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{inf.platform}</span>
                      {inf.instagramVerified && <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full">IG ✓</span>}
                      {inf.youtubeVerified && <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full">YT ✓</span>}
                      {!inf.instagramVerified && !inf.youtubeVerified && (
                        <span className="text-xs bg-[#1E1E2E] text-[#64748B] px-2 py-0.5 rounded-full">Unverified</span>
                      )}
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 bg-[#0D0D1A] rounded-lg p-2 text-center">
                        {inf.followersPublic ? (
                          <p className="text-xs font-medium text-[#F8FAFC]">{inf.followers}</p>
                        ) : (
                          <p className="text-xs text-[#64748B]">🔒 Private</p>
                        )}
                        <p className="text-xs text-[#64748B]">Followers</p>
                      </div>
                      <div className="flex-1 bg-[#0D0D1A] rounded-lg p-2 text-center">
                        <p className="text-xs font-medium text-[#F8FAFC]">{inf.engagement}</p>
                        <p className="text-xs text-[#64748B]">Engagement</p>
                      </div>
                      <div className="flex-1 bg-[#0D0D1A] rounded-lg p-2 text-center">
                        <p className="text-xs font-medium text-[#F8FAFC]">{inf.rate}</p>
                        <p className="text-xs text-[#64748B]">Avg. rate</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a
                        href={`/influencer/${inf.id}`}
                        onClick={e => e.stopPropagation()}
                        className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-500 transition-colors"
                      >
                        Unlock contact — 5 cr
                      </a>
                      <button
                        onClick={e => e.stopPropagation()}
                        className="w-full border border-[#1E1E2E] text-[#94A3B8] py-2 rounded-lg text-xs hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors"
                      >
                        AI report — 3 cr
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full ${colorMap[inf.initials] || "bg-purple-500"} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                        {inf.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="font-medium text-[#F8FAFC] text-sm">{firstName(inf.name)}</span>
                          {inf.verified && <span className="bg-cyan-500/10 text-cyan-400 text-xs px-1.5 py-0.5 rounded-full font-semibold border border-cyan-500/20">✓ Verified</span>}
                        </div>
                        <p className="text-xs text-[#64748B]">{inf.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{inf.niche}</span>
                      <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{inf.platform}</span>
                      {inf.instagramVerified && <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full">IG ✓</span>}
                      {inf.youtubeVerified && <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full">YT ✓</span>}
                      {!inf.instagramVerified && !inf.youtubeVerified && (
                        <span className="text-xs bg-[#1E1E2E] text-[#64748B] px-2 py-0.5 rounded-full">Unverified</span>
                      )}
                    </div>
                    <div className="bg-[#0D0D1A] rounded-lg px-3 py-2 mb-3 text-xs text-[#64748B]">
                      🔒 Sign in to see stats and contact details
                    </div>
                    <a
                      href={`/influencer/${inf.id}`}
                      onClick={e => e.stopPropagation()}
                      className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-500 transition-colors"
                    >
                      View profile
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
