"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const niches = ["All", "Food", "Tech", "Fitness", "Finance", "Fashion", "Travel", "Gaming"]

const colorMap: Record<string, string> = {
  PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
  VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
  MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
}

function getInitials(name: string) {
  const parts = name?.trim().split(" ")
  return parts?.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (name?.slice(0, 2).toUpperCase() || "??")
}

function getColor(initials: string) {
  return colorMap[initials] || "bg-gray-600"
}

function firstName(name: string) {
  return name?.split(" ")[0] || name
}

function rankColor(rank: number) {
  if (rank === 1) return "text-yellow-400"
  if (rank === 2) return "text-slate-300"
  if (rank === 3) return "text-amber-600"
  return "text-[#64748B]"
}

function rankSize(rank: number) {
  if (rank <= 3) return "text-3xl font-bold"
  return "text-xl font-bold"
}

export default function Leaderboard() {
  const { data: session, status } = useSession()
  const loggedIn = status !== "loading" && !!session
  const [selectedNiche, setSelectedNiche] = useState("All")
  const [influencers, setInfluencers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchInfluencers()
  }, [selectedNiche])

  async function fetchInfluencers() {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedNiche !== "All") params.set("niche", selectedNiche)
    const res = await fetch(`/api/influencers?${params}`)
    const data = await res.json()
    const sorted = (data.influencers || []).sort((a: any, b: any) => b.score - a.score).slice(0, 10)
    setInfluencers(sorted)
    setLoading(false)
  }

  function handleShare(inf: any) {
    const displayName = loggedIn ? inf.name : firstName(inf.name)
    const text = `Check out ${displayName} on InfluenceIQ leaderboard - erasekit.vercel.app/leaderboard`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(inf.id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const top3 = influencers.slice(0, 3)
  const rest = influencers.slice(3)

  return (
    <main className="min-h-screen bg-[#0A0A0F]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#1E1E2E] sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md z-50">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold text-[#F8FAFC]">Influence<span className="text-purple-400">IQ</span></span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          <a href="/discover" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Find Influencers</a>
          <a href="/leaderboard" className="text-sm text-purple-400 font-medium">Leaderboard</a>
          <a href="/campaigns" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Campaigns</a>
          <a href="/pricing" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Pricing</a>
          {loggedIn ? (
            <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">Dashboard</a>
          ) : (
            <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">Sign in</a>
          )}
        </div>
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-[#94A3B8] transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#94A3B8] transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#94A3B8] transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E1E2E] bg-[#0A0A0F] px-4 py-4 flex flex-col gap-3">
          <a href="/discover" className="text-sm text-[#94A3B8] py-2 border-b border-[#1E1E2E]">Find Influencers</a>
          <a href="/leaderboard" className="text-sm text-purple-400 font-medium py-2 border-b border-[#1E1E2E]">Leaderboard</a>
          <a href="/campaigns" className="text-sm text-[#94A3B8] py-2 border-b border-[#1E1E2E]">Campaigns</a>
          <a href="/pricing" className="text-sm text-[#94A3B8] py-2 border-b border-[#1E1E2E]">Pricing</a>
          {loggedIn
            ? <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center">Dashboard</a>
            : <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center">Sign in</a>
          }
        </div>
      )}

      {/* Hero */}
      <section className="relative px-4 md:px-8 py-12 md:py-16 text-center max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-[radial-gradient(#1E1E2E_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-transparent to-[#0A0A0F] pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Updated every Monday
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            Top Influencers{" "}
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              This Week
            </span>
          </h1>
          <p className="text-[#94A3B8] text-base md:text-lg max-w-xl mx-auto">
            India's most trusted creators ranked by AI score
          </p>
          {!loggedIn && (
            <p className="text-xs text-[#64748B] mt-3">
              🔒 <a href="/signup" className="text-purple-400 hover:underline">Sign in free</a> to see full names, scores, and follower counts
            </p>
          )}
        </div>
      </section>

      <div className="px-4 md:px-8 pb-16 max-w-4xl mx-auto">

        {/* Niche tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-10" style={{ scrollbarWidth: "none" }}>
          {niches.map(n => (
            <button
              key={n}
              onClick={() => setSelectedNiche(n)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedNiche === n
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {loading ? (
          /* Skeleton */
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 animate-pulse flex items-center gap-4">
                <div className="w-10 text-center">
                  <div className="h-6 w-6 bg-[#1E1E2E] rounded mx-auto" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1E1E2E] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#1E1E2E] rounded w-32" />
                  <div className="h-2.5 bg-[#1E1E2E] rounded w-20" />
                </div>
                <div className="h-8 w-16 bg-[#1E1E2E] rounded-lg" />
              </div>
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🏆</div>
            <p className="font-medium text-[#94A3B8] mb-1">No influencers found</p>
            <p className="text-sm text-[#64748B]">Try a different niche</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length > 0 && (
              <div className="mb-10">
                <p className="text-xs text-[#64748B] uppercase tracking-widest font-medium mb-4">Top 3 this week</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Reorder for visual podium: 2nd left, 1st center, 3rd right on desktop */}
                  {[top3[1], top3[0], top3[2]].filter(Boolean).map((inf, visualIdx) => {
                    const rank = inf === top3[0] ? 1 : inf === top3[1] ? 2 : 3
                    const initials = getInitials(inf.name)
                    const color = getColor(initials)
                    const isFirst = rank === 1
                    return (
                      <div
                        key={inf.id}
                        className={`relative bg-[#12121A] rounded-2xl border p-5 flex flex-col items-center text-center transition-all hover:-translate-y-0.5 ${
                          isFirst
                            ? "border-yellow-500/30 shadow-lg shadow-yellow-500/10 sm:order-2"
                            : rank === 2
                            ? "border-slate-400/20 sm:order-1"
                            : "border-amber-700/20 sm:order-3"
                        }`}
                      >
                        {isFirst && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</span>
                        )}
                        <div className={`${rankSize(rank)} ${rankColor(rank)} mb-3 mt-1`}>
                          #{rank}
                        </div>
                        <div className={`${isFirst ? "w-16 h-16" : "w-12 h-12"} rounded-full ${color} flex items-center justify-center text-white font-semibold ${isFirst ? "text-lg" : "text-sm"} mb-3`}>
                          {initials}
                        </div>
                        <div className="font-semibold text-[#F8FAFC] text-sm mb-1">
                          {loggedIn ? inf.name : firstName(inf.name)}
                          {inf.verified && <span className="ml-1 text-cyan-400 text-xs">✓</span>}
                        </div>
                        <div className="flex gap-1 justify-center flex-wrap mb-3">
                          <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">{inf.niche}</span>
                          <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{inf.platform}</span>
                        </div>
                        <div className="mb-3">
                          {loggedIn ? (
                            <div className={`${isFirst ? "text-2xl" : "text-xl"} font-bold text-purple-400`}>{inf.score}</div>
                          ) : (
                            <div className="text-xl text-[#334155]">🔒</div>
                          )}
                          <div className="text-xs text-[#64748B]">AI Score</div>
                        </div>
                        <a
                          href={`/influencer/${inf.id}`}
                          className="block w-full text-center bg-purple-500/10 border border-purple-500/20 text-purple-400 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors"
                        >
                          View Profile →
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Full ranked list #4–10 */}
            {rest.length > 0 && (
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-widest font-medium mb-4">Full rankings</p>
                <div className="space-y-3">
                  {influencers.map((inf, idx) => {
                    const rank = idx + 1
                    const initials = getInitials(inf.name)
                    const color = getColor(initials)
                    const isFirst = rank === 1
                    return (
                      <div
                        key={inf.id}
                        className={`bg-[#12121A] rounded-2xl border p-4 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                          isFirst
                            ? "border-yellow-500/30 hover:shadow-yellow-500/10"
                            : "border-[#1E1E2E] hover:border-purple-500/30 hover:shadow-purple-500/10"
                        }`}
                      >
                        {/* Rank */}
                        <div className={`w-8 text-center flex-shrink-0 ${rankSize(rank)} ${rankColor(rank)}`}>
                          {isFirst ? "👑" : `#${rank}`}
                        </div>

                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                          {initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-medium text-[#F8FAFC] text-sm truncate">
                              {loggedIn ? inf.name : firstName(inf.name)}
                            </span>
                            {inf.verified && <span className="text-cyan-400 text-xs flex-shrink-0">✓</span>}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{inf.niche}</span>
                            <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{inf.platform}</span>
                          </div>
                        </div>

                        {/* Score + Followers */}
                        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 min-w-[64px]">
                          {loggedIn ? (
                            <>
                              <span className="text-base font-bold text-purple-400">{inf.score}</span>
                              <span className="text-xs text-[#64748B]">AI Score</span>
                            </>
                          ) : (
                            <>
                              <span className="text-base text-[#334155]">🔒</span>
                              <span className="text-xs text-[#64748B]">AI Score</span>
                            </>
                          )}
                        </div>

                        <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0 min-w-[64px]">
                          {loggedIn && inf.followersPublic ? (
                            <>
                              <span className="text-sm font-medium text-[#F8FAFC]">{inf.followers}</span>
                              <span className="text-xs text-[#64748B]">Followers</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-[#334155]">🔒</span>
                              <span className="text-xs text-[#64748B]">Followers</span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleShare(inf)}
                            title="Copy share link"
                            className="w-8 h-8 rounded-lg bg-[#1E1E2E] hover:bg-[#2A2A3E] text-[#64748B] hover:text-[#94A3B8] transition-colors flex items-center justify-center text-sm"
                          >
                            {copied === inf.id ? "✓" : "⎘"}
                          </button>
                          <a
                            href={`/influencer/${inf.id}`}
                            className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors whitespace-nowrap"
                          >
                            View →
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Guest CTA */}
        {!loggedIn && !loading && influencers.length > 0 && (
          <div className="mt-10 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="font-semibold text-[#F8FAFC] mb-1">See the full picture</div>
            <div className="text-sm text-[#94A3B8] mb-4">Sign in free to unlock AI scores, follower counts, and full names.</div>
            <a href="/signup" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
              Create free account
            </a>
          </div>
        )}
      </div>

      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-8 text-center text-sm text-[#64748B]">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}
