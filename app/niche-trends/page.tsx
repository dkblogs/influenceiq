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

        {/* ── Section 1: Hero Header ── */}
        <div className="mb-12 text-center relative">
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/8 rounded-full blur-[100px]" />
          </div>
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-xs text-purple-300 mb-5">
            🇮🇳 India Influencer Market Intelligence
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#F8FAFC] mb-4 leading-tight">
            📊 India Influencer<br className="hidden md:block" /> Niche Trend Report
          </h1>
          <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto mb-5">
            Powered by real creator data + AI market analysis
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap mb-5">
            <span className="text-xs bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] px-3 py-1.5 rounded-full font-medium">
              🔄 Updated daily
            </span>
            <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full font-medium">
              🆓 Free for everyone
            </span>
            {data?.totalInfluencers !== undefined && (
              <span className="text-xs bg-[#12121A] border border-[#1E1E2E] text-[#64748B] px-3 py-1.5 rounded-full">
                {data.totalInfluencers} verified creators analysed
              </span>
            )}
            {data?.generatedAt && (
              <span className="text-xs text-[#64748B]">Last updated: {data.generatedAt}</span>
            )}
          </div>
          <div className="inline-flex items-center gap-3 bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-2 text-xs text-[#64748B]">
            <span className="text-green-400 font-medium">📊 Platform data</span>
            <span>= real InfluenceIQ creator stats</span>
            <span className="text-[#2E2E3E]">·</span>
            <span className="text-blue-400 font-medium">🤖 AI insights</span>
            <span>= India market analysis</span>
          </div>
        </div>

        {/* ── Section 2: How It Works ── */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-[#F8FAFC] text-center mb-6">How this report works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "🗄️",
                title: "Real Platform Data",
                desc: "We analyse verified creator profiles on InfluenceIQ to extract engagement rates, follower counts and platform activity per niche.",
                accent: "border-green-500/20 bg-green-500/5",
                iconBg: "bg-green-500/10",
              },
              {
                icon: "🤖",
                title: "AI Market Analysis",
                desc: "Our AI analyses India's current social media landscape to generate trend scores, momentum signals and brand opportunities.",
                accent: "border-blue-500/20 bg-blue-500/5",
                iconBg: "bg-blue-500/10",
              },
              {
                icon: "📈",
                title: "Daily Updates",
                desc: "Trends refresh every 24 hours so you always see the most current picture of India's creator economy.",
                accent: "border-purple-500/20 bg-purple-500/5",
                iconBg: "bg-purple-500/10",
              },
            ].map(card => (
              <div key={card.title} className={`rounded-2xl border p-5 ${card.accent}`}>
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center text-xl mb-3`}>
                  {card.icon}
                </div>
                <h3 className="font-semibold text-[#F8FAFC] text-sm mb-2">{card.title}</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: How to Use It ── */}
        <div className="mb-12 bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[#F8FAFC] mb-4">How to use this report</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { step: "1", icon: "🔍", title: "Browse niches", desc: "Find which content categories are trending right now in India" },
              { step: "2", icon: "📊", title: "Check momentum", desc: "Rising 🔥 means opportunity, Declining 📉 means saturation" },
              { step: "3", icon: "⏰", title: "Use best times", desc: "Post at peak hours shown for each niche for maximum reach" },
              { step: "4", icon: "💡", title: "Read insights", desc: "Brand opportunity and creator tips are tailored per niche" },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <span className="text-sm font-medium text-[#F8FAFC]">{item.icon} {item.title}</span>
                  <p className="text-xs text-[#64748B] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
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
            {/* ── Section 4: Today's Snapshot Banner ── */}
            <div className="relative overflow-hidden rounded-2xl mb-8 p-6 md:p-8">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-[#12121A] to-amber-900/30 border border-purple-500/30 rounded-2xl" />
              <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] translate-x-1/4 translate-y-1/4 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300 font-medium mb-3">
                      🔥 Today&apos;s Snapshot — {data.generatedAt}
                    </div>
                    <p className="text-[#94A3B8] text-sm leading-relaxed max-w-2xl">{data.overallInsight}</p>
                  </div>
                  <div className="flex-shrink-0 bg-purple-600/20 border border-purple-500/30 rounded-2xl px-6 py-4 text-center">
                    <p className="text-xs text-purple-300 font-medium mb-1">🔥 Hottest niche right now</p>
                    <p className="text-2xl font-bold text-[#F8FAFC]">{data.hotNiche}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Niche filter */}
              <div className="flex gap-2 overflow-x-auto flex-nowrap pb-1">
                {niches.map(n => (
                  <button
                    key={n}
                    onClick={() => setNicheFilter(n)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
                    <p className="text-xs text-[#64748B] italic mb-3">&ldquo;{t.audienceInsight}&rdquo;</p>

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
        InfluenceIQ · India&apos;s AI Influencer Marketplace · 2025
      </footer>
    </main>
  )
}
