"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Navbar from "@/app/components/Navbar"

type Trend = {
  niche: string
  trendScore: number
  momentum: "rising" | "stable" | "declining"
  dataSource: "platform" | "ai"
  mostActivePlatforms: string[]
  averageEngagement: string
  bestTimeToPost: string
  audienceInsight: string
  brandOpportunity: string
  creatorTip: string
}

type TrendsData = {
  trends: Trend[]
  overallInsight: string
  hotNiche: string
  generatedAt: string
  totalInfluencers?: number
}

function momentumBadge(m: string) {
  if (m === "rising") return { label: "🔥 Rising", cls: "bg-green-500/10 border-green-500/30 text-green-400" }
  if (m === "declining") return { label: "📉 Declining", cls: "bg-red-500/10 border-red-500/30 text-red-400" }
  return { label: "➡️ Stable", cls: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" }
}

function scoreColor(s: number) {
  if (s >= 75) return "bg-green-500"
  if (s >= 50) return "bg-yellow-400"
  return "bg-red-400"
}

type View = "all" | "brands" | "creators"

export default function NicheTrends() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [nicheFilter, setNicheFilter] = useState("All")
  const [view, setView] = useState<View>("all")

  const user = (session?.user as any)
  const role = user?.role

  useEffect(() => {
    fetch("/api/niche-trends")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return }
        setData(d)
        setLoading(false)
      })
      .catch(() => { setError("Failed to load trends"); setLoading(false) })
  }, [])

  const niches = data ? ["All", ...data.trends.map(t => t.niche)] : ["All"]

  const filtered = data?.trends
    .filter(t => nicheFilter === "All" || t.niche === nicheFilter)
    .sort((a, b) => b.trendScore - a.trendScore) ?? []

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 md:px-8 py-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-xs text-purple-300 mb-4">
            🤖 Powered by real InfluenceIQ data + AI analysis
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-3">
            Niche Trend Report 📊
          </h1>
          <p className="text-[#94A3B8] text-base max-w-xl mx-auto">
            AI-powered insights into India's influencer marketing landscape
          </p>
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <span className="text-xs bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] px-3 py-1 rounded-full">
              🔄 Updated daily
            </span>
            {data?.totalInfluencers !== undefined && (
              <span className="text-xs text-[#64748B]">
                Based on {data.totalInfluencers} verified creators
              </span>
            )}
            {data?.generatedAt && (
              <span className="text-xs text-[#64748B]">Last updated: {data.generatedAt}</span>
            )}
          </div>
          <div className="mt-4 inline-flex items-center gap-3 bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-2 text-xs text-[#64748B]">
            <span className="text-green-400 font-medium">📊 Platform data</span>
            <span>= real InfluenceIQ creator stats</span>
            <span className="mx-1 text-[#1E1E2E]">·</span>
            <span className="text-blue-400 font-medium">🤖 AI insights</span>
            <span>= India market analysis</span>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[#64748B] text-sm">Analysing niche trends with AI…</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Overall insight card */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6 mb-6">
              <p className="text-[#94A3B8] leading-relaxed mb-4">{data.overallInsight}</p>
              <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 px-4 py-2 rounded-xl">
                <span className="text-purple-300 text-sm font-medium">🔥 Hottest niche right now:</span>
                <span className="text-purple-400 font-bold">{data.hotNiche}</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Niche filter */}
              <div className="flex gap-2 flex-wrap">
                {niches.map(n => (
                  <button
                    key={n}
                    onClick={() => setNicheFilter(n)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      nicheFilter === n
                        ? "bg-purple-600 text-white"
                        : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:text-[#F8FAFC]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex gap-1 ml-auto bg-[#12121A] border border-[#1E1E2E] rounded-xl p-1 self-start">
                {(["all", "brands", "creators"] as View[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      view === v ? "bg-purple-600 text-white" : "text-[#64748B] hover:text-[#94A3B8]"
                    }`}
                  >
                    {v === "all" ? "All" : v === "brands" ? "For Brands" : "For Creators"}
                  </button>
                ))}
              </div>
            </div>

            {/* Trend cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {filtered.map(t => {
                const badge = momentumBadge(t.momentum)
                return (
                  <div key={t.niche} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5 hover:border-purple-500/30 transition-colors">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[#F8FAFC] text-lg">{t.niche}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    {/* Source badge */}
                    <div className="mb-3">
                      {t.dataSource === "platform" ? (
                        <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full font-medium">
                          📊 Based on platform data
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-medium">
                          🤖 AI market analysis
                        </span>
                      )}
                    </div>

                    {/* Trend score bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#64748B]">Trend Score</span>
                        <span className="text-sm font-bold text-[#F8FAFC]">{t.trendScore}/100</span>
                      </div>
                      <div className="w-full bg-[#1E1E2E] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${scoreColor(t.trendScore)}`}
                          style={{ width: `${t.trendScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Platform tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {t.mostActivePlatforms.map(p => (
                        <span key={p} className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2.5 py-1 rounded-full">
                          📱 {p}
                        </span>
                      ))}
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-4 mb-3 text-xs">
                      <div>
                        <span className="text-[#64748B]">Avg Engagement </span>
                        <span className="text-[#10B981] font-medium">{t.averageEngagement}</span>
                      </div>
                    </div>

                    {/* Best time */}
                    <div className="text-xs text-[#64748B] mb-3">
                      🕐 Best time: <span className="text-[#94A3B8]">{t.bestTimeToPost}</span>
                    </div>

                    {/* Audience insight */}
                    <p className="text-xs text-[#64748B] italic mb-3">"{t.audienceInsight}"</p>

                    {/* Brand / Creator insight based on view */}
                    {(view === "all" || view === "brands") && (
                      <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3 mb-2">
                        <div className="text-xs font-medium text-purple-400 mb-1">💼 Brand Opportunity</div>
                        <p className="text-xs text-[#94A3B8]">{t.brandOpportunity}</p>
                      </div>
                    )}
                    {(view === "all" || view === "creators") && (
                      <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3">
                        <div className="text-xs font-medium text-cyan-400 mb-1">🎯 Creator Tip</div>
                        <p className="text-xs text-[#94A3B8]">{t.creatorTip}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6 text-center">
              {status === "unauthenticated" && (
                <>
                  <p className="text-[#94A3B8] mb-4">Join InfluenceIQ to find top creators in these niches</p>
                  <a
                    href="/signup"
                    className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                  >
                    Join InfluenceIQ Free →
                  </a>
                </>
              )}
              {role === "brand" && (
                <>
                  <p className="text-[#94A3B8] mb-4">Browse influencers in these trending niches</p>
                  <a
                    href="/discover/influencers"
                    className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                  >
                    Browse Influencers →
                  </a>
                </>
              )}
              {role === "influencer" && (
                <>
                  <p className="text-[#94A3B8] mb-4">See how you rank in your niche</p>
                  <a
                    href="/dashboard"
                    className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                  >
                    Go to Dashboard →
                  </a>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-8 text-center text-sm text-[#64748B] mt-8">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>
    </main>
  )
}
