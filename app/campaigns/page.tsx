"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Navbar from "@/app/components/Navbar"
import InsufficientCreditsError from "@/app/components/InsufficientCreditsError"
import { useApp } from "@/app/context/AppContext"
import { NICHES, PLATFORMS } from "@/lib/constants"

export default function Campaigns() {
  const { data: session, status } = useSession()
  const { credits, refreshCredits } = useApp()
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [applied, setApplied] = useState<string[]>([])
  const [error, setError] = useState("")
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([])
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())

  const role = (session?.user as any)?.role
  const isInfluencer = status === "authenticated" && role === "influencer"
  const isBrand = status === "authenticated" && role === "brand"
  const userId = (session?.user as any)?.id

  useEffect(() => {
    fetch(`/api/campaigns`)
      .then(res => res.json())
      .then(data => setDbCampaigns(data.campaigns || []))

    if (isInfluencer) {
      fetch("/api/my-applications")
        .then(res => res.json())
        .then(data => {
          const ids = new Set<string>(
            (data.applications || []).map((a: any) => a.campaign?.id).filter(Boolean)
          )
          setAppliedIds(ids)
        })
    }
  }, [session?.user?.id, isInfluencer])

  const allCampaigns = dbCampaigns

  const filtered = allCampaigns.filter((c) => {
    const cPlatforms = c.platforms?.length ? c.platforms : (c.platform ? [c.platform] : [])
    const matchNiche = selectedNiches.length === 0 || selectedNiches.includes(c.niche)
    const matchPlatform = selectedPlatforms.length === 0 || cPlatforms.some((p: string) => selectedPlatforms.includes(p))
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.brand?.toLowerCase().includes(search.toLowerCase()) ||
      c.niche?.toLowerCase().includes(search.toLowerCase())
    return matchNiche && matchPlatform && matchSearch
  })

  async function handleApply(campaignId: string) {
    if (!session) {
      window.location.href = "/login"
      return
    }
    setError("")

    if (credits !== null && credits < 2) {
      setError("CREDITS")
      return
    }

    if (applied.includes(campaignId)) return

    const res = await fetch("/api/apply-campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, userId: session.user.id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(res.status === 402 ? "CREDITS" : (data.error || "Failed to apply"))
      return
    }

    setApplied([...applied, campaignId])
    setAppliedIds(prev => new Set([...prev, campaignId]))
    refreshCredits()
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 md:px-8 py-8 md:py-10 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-block bg-orange-500/10 text-orange-400 text-xs px-3 py-1 rounded-full mb-3 border border-orange-500/20">For Influencers</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC] mb-1">Open Campaigns</h1>
            <p className="text-[#94A3B8] text-sm">Brands actively looking for influencers. Apply directly — 2 credits per application.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 px-4 py-3 rounded-lg mb-6 border border-red-500/20">
            {error === "CREDITS"
              ? <InsufficientCreditsError action="apply to campaigns" required={2} current={credits} from="/campaigns" />
              : <span className="text-sm text-red-400">{error}</span>}
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#12121A] text-[#F8FAFC] placeholder-[#64748B]"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {applied.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-sm text-[#10B981] whitespace-nowrap">
              ✓ {applied.length} applied
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="text-xs text-[#64748B] mb-2 font-medium uppercase tracking-wide">
            Niche {selectedNiches.length > 0 && <span className="text-purple-400 normal-case">({selectedNiches.length} selected)</span>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {NICHES.map((n) => (
              <button key={n}
                onClick={() => setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedNiches.includes(n) ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs text-[#64748B] mb-2 font-medium uppercase tracking-wide">
            Platform {selectedPlatforms.length > 0 && <span className="text-purple-400 normal-case">({selectedPlatforms.length} selected)</span>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map((p) => (
              <button key={p}
                onClick={() => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedPlatforms.includes(p) ? "bg-[#F8FAFC] text-[#0A0A0F]" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-[#64748B] mb-4">
          {filtered.length} open campaign{filtered.length !== 1 ? "s" : ""} found
        </div>

        {allCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">No campaigns posted yet.</p>
            {role === "brand" && (
              <a href="/post-campaign" className="text-purple-400 underline mt-2 block">
                Post the first campaign →
              </a>
            )}
            {role === "influencer" && (
              <p className="text-white/40 text-sm mt-2">Check back soon — brands are joining every day!</p>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-medium text-[#94A3B8] mb-1">No campaigns match your filters</div>
            <div className="text-sm">Try a different niche or platform</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <a key={c.id} href={`/campaigns/${c.id}`} className="block bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4 md:p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${c.brandColor || "bg-purple-500"} flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}>
                    {c.brandInitials || c.brand?.slice(0, 2).toUpperCase() || "BR"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1">
                      <div>
                        <div className="font-medium text-[#F8FAFC] mb-0.5">{c.title}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-[#64748B]">{c.brand || "Brand"} · {c.location}</span>
                          {c.brandVerified && (
                            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">✓ Verified Brand</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-shrink-0 sm:ml-4">
                        <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full font-medium">{c.status}</span>
                        <span className="text-xs text-red-400 font-medium">{c.deadline}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[#94A3B8] mb-4 leading-relaxed">{c.description}</p>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">💰 {c.budget}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(c.platforms?.length ? c.platforms : [c.platform]).map((p: string) => (
                          <span key={p} className="text-xs text-[#94A3B8]">📱 {p}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">👥 Min. {c.minFollowers}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">🎯 {c.slots} slots</div>
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">{c.niche}</span>
                    </div>
                    <div className="flex gap-3">
                      {isInfluencer ? (
                        appliedIds.has(c.id) || applied.includes(c.id) ? (
                          <span className="px-5 py-2 rounded-lg text-sm font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                            ✅ Applied
                          </span>
                        ) : (credits !== null && credits < 2) ? (
                          <div className="flex flex-col gap-1">
                            <button disabled className="px-5 py-2 rounded-lg text-sm font-medium bg-[#1E1E2E] text-[#64748B] cursor-not-allowed opacity-60">
                              Apply now — 2 credits
                            </button>
                            <span className="text-xs text-red-400">
                              Needs 2 credits. You have {credits}.{" "}
                              <a href="/pricing?from=/campaigns" className="text-purple-400 underline hover:text-purple-300">Buy credits →</a>
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApply(c.id) }}
                            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20"
                          >
                            Apply now — 2 credits
                          </button>
                        )
                      ) : isBrand ? (
                        c.brandId === userId ? (
                          <a
                            href="/my-campaigns"
                            onClick={e => e.stopPropagation()}
                            className="px-5 py-2 rounded-lg text-sm font-medium bg-[#1E1E2E] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E1E2E] transition-colors"
                          >
                            View Applicants →
                          </a>
                        ) : null
                      ) : status === "unauthenticated" ? (
                        <a
                          href="/login"
                          className="px-5 py-2 rounded-lg text-sm font-medium bg-[#12121A] border border-[#1E1E2E] text-[#64748B] hover:text-[#94A3B8] transition-colors"
                        >
                          Sign in as Influencer to Apply
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-8 text-center text-sm text-[#64748B] mt-8">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>
    </main>
  )
}
