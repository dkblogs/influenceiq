"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import InsufficientCreditsError from "@/app/components/InsufficientCreditsError"
import { useApp } from "@/app/context/AppContext"
import React from "react"
import { CONTENT_TYPES } from "@/lib/constants"

function firstName(name: string) {
  return name?.split(" ")[0] || name
}

function displayFollowers(inf: any): string | null {
  if (inf.followers && inf.followers !== "0" && inf.followers !== "") return inf.followers
  const total = (inf.instagramFollowers || 0) + (inf.youtubeFollowers || 0)
  if (total === 0) return null
  if (total >= 1000000) return (total / 1000000).toFixed(1) + "M"
  if (total >= 1000) return Math.round(total / 1000) + "K"
  return total.toString()
}

function displayEngagement(inf: any): string | null {
  if (!inf.engagement || inf.engagement === "0%" || inf.engagement === "0") return null
  return inf.engagement
}

function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-500 hover:text-indigo-400 transition-colors ml-1.5 text-xs leading-none"
        aria-label="Improvement tip"
      >
        💡
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#1E293B] border border-indigo-500/20 rounded-xl p-3 text-xs text-gray-300 leading-relaxed shadow-xl">
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5 flex-shrink-0">💡</span>
            <span>{text}</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E293B]"/>
        </div>
      )}
    </div>
  )
}

function displayRate(inf: any): string | null {
  if (!inf.rate || inf.rate === "₹0/post" || inf.rate === "0" || inf.rate === "") return null
  return inf.rate
}

function SignupPromptCard() {
  return (
    <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-8 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="font-semibold text-[#F8FAFC] mb-2">Create a free account to continue</h2>
      <p className="text-[#94A3B8] text-sm mb-6 max-w-sm mx-auto">
        Sign up free to see this influencer's full profile, contact details, AI score breakdown, and more.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/signup" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
          Create free account
        </a>
        <a href="/login" className="border border-[#1E1E2E] text-[#94A3B8] px-6 py-2.5 rounded-lg text-sm hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors">
          Sign in
        </a>
      </div>
      <p className="text-xs text-[#64748B] mt-4">5 free credits on signup · No card needed</p>
    </div>
  )
}

export default function InfluencerProfile() {
  const { data: session, status } = useSession()
  const { credits, refreshCredits } = useApp()
  const loggedIn = status !== "loading" && !!session
  const params = useParams()
  const router = useRouter()
  const [influencer, setInfluencer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState("")
  const [brandReport, setBrandReport] = useState<any>(null)
  const [scoring, setScoring] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [reviewsAvg, setReviewsAvg] = useState(0)
  const [followersPublic, setFollowersPublic] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio">("overview")
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [proposalForm, setProposalForm] = useState({ campaignTitle: "", contentType: "Instagram Reel", description: "", deliverables: "", location: "", timeline: "", startDate: "", endDate: "", remuneration: "", remunerationDetails: "", exclusivity: false, revisions: 2, additionalTerms: "" })
  const [proposalSending, setProposalSending] = useState(false)
  const [proposalSent, setProposalSent] = useState(false)
  const [proposalError, setProposalError] = useState<React.ReactNode>("")
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [portfolioLoading, setPortfolioLoading] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const colorMap: Record<string, string> = {
    PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
    VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
    MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
  }

  useEffect(() => {
    if (params.id) fetchInfluencer()
  }, [params.id])

  useEffect(() => {
    if (!params.id) return
    setPortfolioLoading(true)
    fetch(`/api/portfolio?influencerId=${params.id}`)
      .then(res => res.json())
      .then(data => { setPortfolioItems(data.items || []); setPortfolioLoading(false) })
      .catch(() => setPortfolioLoading(false))
  }, [params.id])

  useEffect(() => {
    if (!params.id) return
    const ownerParam = session?.user?.id ? `&ownerId=${session.user.id}` : ""
    fetch(`/api/campaign-reviews?influencerId=${params.id}${ownerParam}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || [])
        setReviewsTotal(data.total || 0)
        setReviewsAvg(data.avgRating || 0)
      })
  }, [params.id, session])

  async function toggleReviewPrivacy(reviewId: string, field: "namePublic" | "reviewPublic", value: boolean) {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, [field]: value } : r))
    await fetch("/api/campaign-reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reviewId, [field]: value }),
    })
  }

  async function fetchInfluencer() {
    setLoading(true)
    try {
      const res = await fetch(`/api/influencers/${params.id}`)
      const data = await res.json()
      if (res.ok && data.influencer) {
        setInfluencer(data.influencer)
        setUnlocked(data.unlocked ?? false)
        setFollowersPublic(data.influencer.followersPublic ?? true)
      } else {
        setInfluencer(null)
      }
    } catch {
      setInfluencer(null)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSavingSettings(true)
    await fetch(`/api/influencers/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followersPublic, requestingUserId: (session?.user as any)?.id }),
    })
    setSavingSettings(false)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
  }


  async function fetchAnalytics() {
    if (analytics) { setShowAnalytics(true); return }
    setAnalyticsLoading(true)
    setAnalyticsError(null)
    try {
      const res = await fetch(`/api/influencers/${params.id}/analytics`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setAnalytics({ ...data.analytics, cached: data.cached })
      setShowAnalytics(true)
    } catch (err: any) {
      setAnalyticsError(err.message)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  async function generateBrandReport() {
    if (!session) { router.push("/login"); return }
    if (credits !== null && credits < 3) {
      setError("CREDITS")
      return
    }
    setScoring(true)
    setError("")
    const res = await fetch("/api/ai-report-brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: params.id }),
    })
    const data = await res.json()
    if (data.success) {
      setBrandReport(data.report)
      refreshCredits()
    } else {
      setError(res.status === 402 ? "CREDITS" : (data.error || "Failed to generate report"))
    }
    setScoring(false)
  }

  function handleSendProposalClick() {
    if (credits !== null && credits < 10) {
      setProposalError(
        <span>
          You need 10 credits to send a proposal. You have {credits}.{" "}
          <a href="/pricing?from=/influencer" className="text-purple-400 underline hover:text-purple-300">Buy credits →</a>
        </span>
      )
      return
    }
    setProposalError("")
    setShowProposalModal(true)
  }

  async function sendProposal() {
    setProposalSending(true)
    setProposalError("")
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: params.id, ...proposalForm }),
    })
    const data = await res.json()
    setProposalSending(false)
    if (!res.ok) {
      setProposalError(
        res.status === 402
          ? <span>Not enough credits. You need 10 credits to send a proposal. You have {credits ?? 0}.{" "}<a href="/pricing?from=/influencer" className="text-purple-400 underline hover:text-purple-300">Buy credits →</a></span>
          : (data.error || "Failed to send proposal")
      )
      return // keep modal open, form data preserved
    }
    setProposalSent(true)
    refreshCredits()
    setTimeout(() => { setShowProposalModal(false); setProposalSent(false) }, 2000)
  }

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#64748B] text-sm">Loading...</div>
      </main>
    )
  }

  if (!influencer) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#64748B] text-sm">Influencer not found</div>
      </main>
    )
  }

  const tier1 = !loggedIn
  const tier2 = loggedIn && !unlocked  // logged in, no agreed proposal yet
  const tier3 = loggedIn && unlocked   // agreed proposal exists — full contact access
  const isOwner = !!(loggedIn && influencer?.userId && (session?.user as any)?.id === influencer.userId)
  const isBrand = loggedIn && (session?.user as any)?.role === "brand"

  return (
    <main className="min-h-screen bg-[#0A0A0F]">

      <Navbar />

      {/* Owner settings panel */}
      {isOwner && (
        <div className="bg-amber-900/20 border-b border-amber-800/30 px-4 md:px-8 py-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-3">Your Profile Settings</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4 flex-1">
                <span className="text-sm text-[#94A3B8]">Follower count visibility</span>
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${followersPublic ? "bg-purple-600" : "bg-[#1E1E2E]"}`}
                  onClick={() => setFollowersPublic(!followersPublic)}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${followersPublic ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-medium text-[#94A3B8]">{followersPublic ? "Public" : "Private"}</span>
              </div>
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="sm:ml-auto text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {savingSettings ? "Saving..." : settingsSaved ? "Saved ✓" : "Save settings"}
              </button>
            </div>
            {!followersPublic && (
              <p className="text-xs text-amber-400/70 mt-2">⚠️ Keeping follower count private may reduce brand interest in your profile.</p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 md:px-8 py-8 md:py-10 max-w-4xl mx-auto">

        {/* Profile header */}
        <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${colorMap[influencer.initials] || "bg-purple-500"} flex items-center justify-center text-white font-semibold text-xl md:text-2xl flex-shrink-0`}>
              {influencer.initials}
            </div>
            <div className="flex-1 min-w-0">

              {/* Name */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F8FAFC]">
                  {tier1 ? firstName(influencer.name) : influencer.name}
                </h1>
                {influencer.verified && (
                  <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-cyan-500/20">✓ InfluenceIQ Verified</span>
                )}
              </div>

              {/* Handle + location */}
              <div className="text-[#64748B] text-sm mb-3">
                {tier1 && (
                  <>{influencer.location} · <span className="inline-flex items-center gap-1">🔒 <a href="/login" className="text-purple-400 hover:underline">Sign in to view</a></span></>
                )}
                {tier2 && (
                  <>{influencer.location}</>
                )}
                {tier3 && (
                  <>{influencer.handle} · {influencer.location}</>
                )}
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {(influencer.niches?.length ? influencer.niches : (influencer.niche ? [influencer.niche] : [])).map((n: string) => (
                  <span key={n} className="text-sm bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">{n}</span>
                ))}
                {(influencer.platforms?.length ? influencer.platforms : (influencer.platform ? [influencer.platform] : [])).map((p: string) => {
                  const isIg = p.toLowerCase().includes("instagram")
                  const isYt = p.toLowerCase().includes("youtube")
                  if (isIg) return (
                    <span key={p} className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${influencer.instagramVerified ? "bg-green-500/20 border border-green-500/40 text-green-300" : "bg-[#1E1E2E] text-[#94A3B8]"}`}>
                      {tier3 ? (influencer.instagramHandle || "Instagram") : "Instagram"}
                      {influencer.instagramVerified ? <span className="text-green-400 text-xs">✓</span> : tier3 && <span className="text-yellow-500 text-xs">⚠</span>}
                      {tier3 && influencer.instagramVerified && influencer.instagramFollowers ? <span className="text-green-400/70 text-xs">· {influencer.instagramFollowers.toLocaleString()}</span> : !tier3 && influencer.instagramVerified && <span className="blur-sm select-none text-xs">••••</span>}
                    </span>
                  )
                  if (isYt) return (
                    <span key={p} className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${influencer.youtubeVerified ? "bg-green-500/20 border border-green-500/40 text-green-300" : "bg-[#1E1E2E] text-[#94A3B8]"}`}>
                      {tier3 ? (influencer.youtubeHandle || "YouTube") : "YouTube"}
                      {influencer.youtubeVerified ? <span className="text-green-400 text-xs">✓</span> : tier3 && <span className="text-yellow-500 text-xs">⚠</span>}
                      {tier3 && influencer.youtubeVerified && influencer.youtubeFollowers ? <span className="text-green-400/70 text-xs">· {influencer.youtubeFollowers.toLocaleString()}</span> : !tier3 && influencer.youtubeVerified && <span className="blur-sm select-none text-xs">••••</span>}
                    </span>
                  )
                  return <span key={p} className="text-sm bg-[#1E1E2E] text-[#94A3B8] px-3 py-1 rounded-full">{p}</span>
                })}
                {influencer.gender && (
                  <span className="text-sm bg-[#1E1E2E] text-[#64748B] px-3 py-1 rounded-full">{influencer.gender}</span>
                )}
              </div>
              <p className="text-[#94A3B8] text-sm leading-relaxed">{influencer.about}</p>
            </div>

            {/* AI Score */}
            <div className="text-center flex-shrink-0 sm:ml-auto">
              {tier1 && (
                <>
                  <div className="text-3xl md:text-4xl text-[#334155]">🔒</div>
                  <div className="text-xs text-[#64748B] mt-1">AI Score</div>
                </>
              )}
              {loggedIn && (
                <>
                  <div className="text-3xl md:text-4xl font-bold text-purple-400">
                    {brandReport?.score ?? influencer.aiScore ?? "—"}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">AI Score</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#12121A] border border-[#1E1E2E] rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "overview" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-[#64748B] hover:text-[#94A3B8]"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "portfolio" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-[#64748B] hover:text-[#94A3B8]"}`}
          >
            Portfolio {portfolioItems.length > 0 && <span className="ml-1 text-xs opacity-70">({portfolioItems.length})</span>}
          </button>
        </div>

        {/* Portfolio tab */}
        {activeTab === "portfolio" && (
          <div className="mb-6">
            {portfolioLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2].map(n => (
                  <div key={n} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 animate-pulse">
                    <div className="h-3 bg-[#1E1E2E] rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-[#1E1E2E] rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-[#1E1E2E] rounded mb-2"></div>
                    <div className="h-3 bg-[#1E1E2E] rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-10 text-center">
                <div className="text-3xl mb-3">📂</div>
                <p className="font-medium text-[#94A3B8] mb-1">No portfolio items yet</p>
                <p className="text-sm text-[#64748B]">This influencer hasn't added any collaborations yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolioItems.map((item: any) => (
                  <div key={item.id} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-xs text-purple-400 font-medium uppercase tracking-wide mb-0.5">{item.brandName}</div>
                        <h3 className="font-semibold text-[#F8FAFC] text-sm leading-snug">{item.campaignTitle}</h3>
                      </div>
                      {item.completedAt && (
                        <span className="text-xs text-[#64748B] whitespace-nowrap flex-shrink-0 mt-0.5">
                          {new Date(item.completedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-[#94A3B8] mb-3 leading-relaxed">{item.description}</p>
                    )}
                    <div className="space-y-2">
                      {item.deliverables && (
                        <div className="bg-[#0D0D1A] rounded-lg px-3 py-2">
                          <div className="text-xs text-[#64748B] font-medium mb-0.5">Deliverables</div>
                          <div className="text-xs text-[#94A3B8]">{item.deliverables}</div>
                        </div>
                      )}
                      {item.results && (
                        <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-lg px-3 py-2">
                          <div className="text-xs text-[#10B981] font-medium mb-0.5">Results</div>
                          <div className="text-xs text-[#94A3B8]">{item.results}</div>
                        </div>
                      )}
                    </div>
                    {item.mediaUrl && (
                      <a
                        href={item.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <span>🔗</span> View campaign media
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Overview tab content */}
        {activeTab === "overview" && (
        <>

        {/* Stats row */}
        {tier1 ? (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 mb-6 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm font-medium text-[#94A3B8] mb-3">Sign in to see stats</p>
            <a href="/login" className="inline-block bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
              Sign in free
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
<div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 md:p-5 text-center">
              {followersPublic ? (
                <div className="text-xl md:text-2xl font-bold text-[#F8FAFC]">{(() => {
                  const count = displayFollowers(influencer)
                  return count ? count : <span className="text-gray-500 text-sm">Not set</span>
                })()}</div>
              ) : (
                <div className="text-sm text-[#64748B] flex flex-col items-center gap-1">
                  <span className="text-lg">🔒</span>
                  <span className="text-xs">Kept private</span>
                </div>
              )}
              <div className="text-xs md:text-sm text-[#64748B] mt-1">Followers</div>
            </div>
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 md:p-5 text-center">
              <div className="text-xl md:text-2xl font-bold text-[#F8FAFC]">{displayEngagement(influencer) ?? <span className="text-gray-500 text-sm">Not set</span>}</div>
              <div className="text-xs md:text-sm text-[#64748B] mt-1">Engagement</div>
            </div>
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 md:p-5 text-center">
              <div className="text-xl md:text-2xl font-bold text-[#F8FAFC]">{displayRate(influencer) ?? <span className="text-gray-500 text-sm">Not set</span>}</div>
              <div className="text-xs md:text-sm text-[#64748B] mt-1">Avg. rate</div>
            </div>
          </div>
        )}

        {/* Audience Analytics */}
        {(isBrand || isOwner) && (
          <div className="mt-6 mb-6">
            {!showAnalytics && (
              <button
                onClick={fetchAnalytics}
                disabled={analyticsLoading}
                className="w-full py-3 border border-indigo-500/30 rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                {analyticsLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Fetching audience data... (this takes ~60s first time)
                  </>
                ) : (
                  <><span>📊</span> View Audience Analytics</>
                )}
              </button>
            )}

            {analyticsError && (
              <p className="text-red-400 text-sm text-center mt-2">{analyticsError}</p>
            )}

            {showAnalytics && analytics && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Audience Analytics</h3>
                  <div className="flex items-center gap-2">
                    {analytics.cached && (
                      <span className="text-xs text-gray-500">Cached · updates every 7 days</span>
                    )}
                    <button onClick={() => setShowAnalytics(false)} className="text-gray-500 hover:text-gray-300 text-sm">
                      Hide
                    </button>
                  </div>
                </div>

                {/* Real metrics */}
                {analytics.real && (
                  <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20">✓ Real Data</span>
                      <span className="text-xs text-gray-500">Based on last {analytics.postCount} posts</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-[#1E293B] rounded-lg p-3 text-center">
                        <div className="text-white font-bold text-lg">{analytics.real.avgLikes?.toLocaleString() || "—"}</div>
                        <div className="text-gray-400 text-xs mt-1">Avg Likes {isOwner && <Tip text="Post consistently at peak hours (7–9 PM IST). Use 5–8 relevant hashtags. Reels get 2–3x more likes than static posts on Instagram." />}</div>
                      </div>
                      <div className="bg-[#1E293B] rounded-lg p-3 text-center">
                        <div className="text-white font-bold text-lg">{analytics.real.avgComments?.toLocaleString() || "—"}</div>
                        <div className="text-gray-400 text-xs mt-1">Avg Comments {isOwner && <Tip text="End every caption with a question to drive comments. Reply to every comment in the first hour — it signals engagement to the algorithm." />}</div>
                      </div>
                      <div className="bg-[#1E293B] rounded-lg p-3 text-center">
                        <div className="text-white font-bold text-lg">{analytics.real.avgViews > 0 ? analytics.real.avgViews?.toLocaleString() : "—"}</div>
                        <div className="text-gray-400 text-xs mt-1">Avg Views</div>
                      </div>
                      <div className="bg-[#1E293B] rounded-lg p-3 text-center">
                        <div className="text-white font-bold text-lg">{analytics.real.postsPerWeek || "—"}</div>
                        <div className="text-gray-400 text-xs mt-1">Posts/Week {isOwner && <Tip text="Optimal posting frequency is 4–5x per week for Reels, 3–4x for static posts. Consistency matters more than volume." />}</div>
                      </div>
                    </div>
                    {analytics.real.engagementTrend?.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Engagement trend (last {analytics.real.engagementTrend.length} posts) {isOwner && <Tip text="Engagement below 2% is low, 2–5% is good, 5%+ is excellent. If trending down, try more interactive content — polls, Q&As, collabs." />}</p>
                        <div className="flex items-end gap-1 h-16">
                          {analytics.real.engagementTrend.map((p: any, i: number) => {
                            const val = parseFloat(p.engagement)
                            const max = Math.max(...analytics.real.engagementTrend.map((x: any) => parseFloat(x.engagement)))
                            const height = max > 0 ? Math.max((val / max) * 100, 4) : 4
                            return (
                              <div
                                key={i}
                                title={`${p.engagement}% engagement`}
                                className="flex-1 bg-indigo-500/60 hover:bg-indigo-400 rounded-t transition-all cursor-pointer"
                                style={{ height: `${height}%` }}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {analytics.real.contentTypes && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Content type breakdown {isOwner && <Tip text="Reels get 3–5x more reach than static posts. Aim for 60%+ Reels in your content mix to maximize organic reach." />}</p>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(analytics.real.contentTypes).map(([type, count]: [string, any]) => {
                            const total = Object.values(analytics.real.contentTypes).reduce((a: any, b: any) => a + b, 0) as number
                            const pct = Math.round((count / total) * 100)
                            const colors: Record<string, string> = { image: "bg-blue-500/20 text-blue-400 border-blue-500/20", video: "bg-purple-500/20 text-purple-400 border-purple-500/20", carousel: "bg-amber-500/20 text-amber-400 border-amber-500/20" }
                            return (
                              <span key={type} className={`text-xs px-3 py-1 rounded-full border ${colors[type] || "bg-gray-500/20 text-gray-400 border-gray-500/20"}`}>
                                {type} {pct}%
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {analytics.real.topHashtags?.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Top hashtags {isOwner && <Tip text="Mix hashtag sizes: 2–3 large (1M+ posts), 3–4 medium (100K–1M), 2–3 niche-specific. Avoid banned hashtags." />}</p>
                        <div className="flex gap-2 flex-wrap">
                          {analytics.real.topHashtags.map((tag: string) => (
                            <span key={tag} className="text-xs bg-[#1E293B] text-gray-300 px-2 py-1 rounded-full border border-[#334155]">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI estimated demographics */}
                {analytics.ai && (
                  <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">✦ AI Estimated</span>
                      <span className="text-xs text-gray-500">Inferred from content, niche & bio</span>
                    </div>
                    {analytics.ai.ageGroups && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Estimated age groups {isOwner && <Tip text="Your content niche determines your audience age. Tech/Finance skews 25–34. Fashion/Beauty skews 18–24. Align your content to your target age group." />}</p>
                        <div className="space-y-2">
                          {analytics.ai.ageGroups.map(({ label, percent }: { label: string; percent: number }) => (
                            <div key={label} className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs w-12">{label}</span>
                              <div className="flex-1 bg-[#1E293B] rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="text-gray-300 text-xs w-8 text-right">{percent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {analytics.ai.genderSplit && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Estimated gender split {isOwner && <Tip text="To attract more brand deals, know your audience gender. Brands in beauty/fashion prefer female-skewed audiences. Tech/Gaming prefer male-skewed." />}</p>
                        <div className="flex gap-3">
                          {Object.entries(analytics.ai.genderSplit).map(([gender, pct]: [string, any]) => (
                            <div key={gender} className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${gender === "male" ? "bg-blue-400" : gender === "female" ? "bg-pink-400" : "bg-gray-400"}`} />
                              <span className="text-gray-300 text-xs capitalize">{gender} {pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {analytics.ai.topLocations && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Estimated top locations {isOwner && <Tip text="Metro city audiences (Mumbai, Delhi, Bangalore) command higher brand deal rates. Use location tags in posts to attract local followers." />}</p>
                        <div className="space-y-2">
                          {analytics.ai.topLocations.map(({ city, percent }: { city: string; percent: number }) => (
                            <div key={city} className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs w-24 truncate">{city}</span>
                              <div className="flex-1 bg-[#1E293B] rounded-full h-2">
                                <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="text-gray-300 text-xs w-8 text-right">{percent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {analytics.ai.audienceInterests?.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Audience interests</p>
                        <div className="flex gap-2 flex-wrap">
                          {analytics.ai.audienceInterests.map((interest: string) => (
                            <span key={interest} className="text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20">{interest}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analytics.ai.bestPostingTimes?.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Best posting times (IST) {isOwner && <Tip text="Schedule posts 15 mins before peak time. Use Instagram Insights (if business account) to see your exact audience active hours." />}</p>
                        <div className="flex gap-2 flex-wrap">
                          {analytics.ai.bestPostingTimes.map((time: string) => (
                            <span key={time} className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">🕐 {time}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analytics.ai.audienceSummary && (
                      <p className="text-gray-400 text-sm leading-relaxed border-t border-[#1E293B] pt-3">{analytics.ai.audienceSummary}</p>
                    )}
                  </div>
                )}

                {!analytics.real && !analytics.ai && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Could not fetch analytics for this influencer.</p>
                    <p className="text-xs mt-1">Instagram handle must be verified.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* AI Score Breakdown */}
        {tier1 ? (
          <div className="mb-6">
            <SignupPromptCard />
          </div>
        ) : isBrand ? (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="font-semibold text-[#F8FAFC]">AI Report</h2>
                <p className="text-xs text-[#64748B] mt-1">Powered by InfluenceIQ AI · Costs 3 credits</p>
              </div>
              {!brandReport && (
                (credits !== null && credits < 3) ? (
                  <div className="flex flex-col items-end gap-1">
                    <button disabled className="px-4 py-2 bg-[#1E1E2E] text-[#64748B] rounded-lg text-sm font-medium cursor-not-allowed opacity-60 whitespace-nowrap">
                      Get AI Report — 3 credits
                    </button>
                    <span className="text-xs text-red-400">
                      Needs 3 credits. You have {credits}.{" "}
                      <a href="/pricing?from=/influencer" className="text-purple-400 underline hover:text-purple-300">Buy credits →</a>
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={generateBrandReport}
                    disabled={scoring}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors whitespace-nowrap shadow-lg shadow-purple-500/20 flex items-center gap-2"
                  >
                    {scoring ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Analyzing...
                      </>
                    ) : "Get AI Report — 3 credits"}
                  </button>
                )
              )}
            </div>

            {error && !brandReport && (
              <div className="bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 mb-4">
                {error === "CREDITS"
                  ? <InsufficientCreditsError action="generate this AI report" required={3} current={credits} from="/influencer" />
                  : <span className="text-sm text-red-400">{error}</span>}
              </div>
            )}

            {brandReport ? (
              <div className="space-y-4">
                {/* Verdict badge */}
                {(() => {
                  const v = brandReport.verdict || ""
                  const isStrong = v.toLowerCase().includes("strong")
                  const isModerate = v.toLowerCase().includes("moderate")
                  const bgClass = isStrong
                    ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]"
                    : isModerate
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                  const icon = isStrong ? "✅" : isModerate ? "⚠️" : "❌"
                  return (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgClass}`}>
                      <span className="text-lg">{icon}</span>
                      <span className="font-semibold text-sm">{brandReport.verdict}</span>
                      <span className="ml-auto text-2xl font-bold">{brandReport.score}<span className="text-xs font-normal opacity-60">/100</span></span>
                    </div>
                  )
                })()}

                {/* Executive summary */}
                <div className="bg-[#0D0D1A] rounded-xl p-4 border border-[#1E1E2E]">
                  <div className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-1.5">Executive Summary</div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{brandReport.summary}</p>
                </div>

                {/* 4 analysis cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: "Brand Fit", value: brandReport.brandFitAnalysis },
                    { label: "Audience Quality", value: brandReport.audienceQuality },
                    { label: "Content Reliability", value: brandReport.contentReliability },
                    { label: "Reach & Impact", value: brandReport.reachAndImpact },
                  ].map(item => (
                    <div key={item.label} className="bg-[#0D0D1A] rounded-xl p-4 border border-[#1E1E2E]">
                      <div className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-1.5">{item.label}</div>
                      <p className="text-sm text-[#94A3B8] leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Risk factors */}
                {brandReport.riskFactors && brandReport.riskFactors.toLowerCase() !== "none identified" && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="text-xs font-medium text-red-400 uppercase tracking-wide mb-1.5">⚠ Risk Factors</div>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{brandReport.riskFactors}</p>
                  </div>
                )}

                {/* Pros + Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-4">
                    <div className="text-xs font-medium text-[#10B981] uppercase tracking-wide mb-2">Pros</div>
                    <ul className="space-y-1.5">
                      {brandReport.pros?.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                          <span className="text-[#10B981] mt-0.5 flex-shrink-0">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2">Cons</div>
                    <ul className="space-y-1.5">
                      {brandReport.cons?.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Ideal campaign types */}
                {brandReport.idealCampaignTypes?.length > 0 && (
                  <div className="bg-[#0D0D1A] rounded-xl p-4 border border-[#1E1E2E]">
                    <div className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">Ideal Campaign Types</div>
                    <div className="flex flex-wrap gap-2">
                      {brandReport.idealCampaignTypes.map((t: string, i: number) => (
                        <span key={i} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimated ROI */}
                {brandReport.estimatedROI && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-1.5">Estimated ROI</div>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{brandReport.estimatedROI}</p>
                  </div>
                )}

                <button
                  onClick={() => { setBrandReport(null); setError("") }}
                  className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors"
                >
                  Generate new report
                </button>
              </div>
            ) : !scoring && (
              <div className="text-center py-8 text-[#64748B]">
                <div className="text-4xl mb-3">⚡</div>
                <div className="font-medium text-[#94A3B8] mb-1">No AI report generated yet</div>
                {influencer.aiReportSummary ? (
                  <p className="text-sm text-[#64748B] mt-2 max-w-md mx-auto">{influencer.aiReportSummary}</p>
                ) : (
                  <div className="text-sm">Click "Get AI Report" for a detailed breakdown — costs 3 credits</div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Non-brand logged-in users: show existing AI score summary read-only */
          influencer.aiScore ? (
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 md:p-8 mb-6">
              <h2 className="font-semibold text-[#F8FAFC] mb-1">AI Score</h2>
              <p className="text-xs text-[#64748B] mb-4">Powered by InfluenceIQ AI</p>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-purple-400">{influencer.aiScore}</span>
                  <span className="text-sm text-[#94A3B8]">Overall AI Score</span>
                </div>
                {influencer.aiReportSummary && (
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{influencer.aiReportSummary}</p>
                )}
              </div>
            </div>
          ) : null
        )}

        {/* Send Proposal — brands only */}
        {isBrand && !isOwner && (
          <div className="bg-[#12121A] rounded-2xl border border-purple-500/20 p-5 md:p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-0.5">Ready to collaborate?</h3>
              <p className="text-sm text-[#64748B]">Send a formal proposal with terms, timeline and remuneration. Costs 10 credits.</p>
              {proposalError && !showProposalModal && (
                <div className="mt-2 text-sm text-red-400">{proposalError}</div>
              )}
            </div>
            <button
              onClick={handleSendProposalClick}
              className="flex-shrink-0 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20 whitespace-nowrap"
            >
              Send Proposal →
            </button>
          </div>
        )}

        {/* Contact section */}
        {tier1 ? null : (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 md:p-8">
            <h2 className="font-semibold text-[#F8FAFC] mb-2">Contact details</h2>

            {tier3 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl">
                  <span className="text-lg">✉️</span>
                  <div>
                    <div className="text-xs text-[#64748B] mb-0.5">Email</div>
                    <div className="font-medium text-[#F8FAFC]">{influencer.email}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${influencer.phone ? "bg-[#10B981]/10 border-[#10B981]/20" : "bg-[#1E1E2E] border-[#1E1E2E]"}`}>
                  <span className="text-lg">📱</span>
                  <div>
                    <div className="text-xs text-[#64748B] mb-0.5">Phone</div>
                    {influencer.phone
                      ? <div className="font-medium text-[#F8FAFC]">{influencer.phone}</div>
                      : <div className="text-sm text-[#64748B] italic">Not provided</div>}
                  </div>
                </div>
                <div className="text-xs text-[#64748B] mt-2">
                  🤝 Contact shared via proposal agreement
                </div>
              </div>
            ) : isBrand ? (
              <div>
                <p className="text-sm text-[#94A3B8] mb-4">
                  Send a proposal to connect with this influencer. Contact details are shared once both parties agree.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-[#0D0D1A] border border-[#1E1E2E] rounded-xl mb-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#94A3B8]">Email address</div>
                    <div className="text-sm text-[#64748B]">••••••••••@••••••.com</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#94A3B8]">Phone number</div>
                    <div className="text-sm text-[#64748B]">+91 ••••• •••••</div>
                  </div>
                </div>
                <button
                  onClick={handleSendProposalClick}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                >
                  Send Proposal →
                </button>
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">
                Contact details are shared between brands and influencers when a collaboration proposal is agreed upon.
              </p>
            )}
          </div>
        )}

        {/* Campaign History */}
        <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 md:p-8 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-[#F8FAFC]">Campaign History</h2>
            <span className="text-xs text-[#64748B]">{reviewsTotal} campaign{reviewsTotal !== 1 ? "s" : ""}</span>
          </div>

          {/* Summary row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((star) => (
                <span key={star} className={`text-lg ${star <= Math.round(reviewsAvg) ? "text-yellow-400" : "text-[#1E1E2E]"}`}>★</span>
              ))}
            </div>
            <span className="text-sm font-medium text-[#94A3B8]">
              {reviewsAvg > 0 ? reviewsAvg.toFixed(1) : "—"}
            </span>
            <span className="text-sm text-[#64748B]">avg across {reviewsTotal} review{reviewsTotal !== 1 ? "s" : ""}</span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-sm">No campaign reviews yet</div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border border-[#1E1E2E] rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-medium text-[#F8FAFC] text-sm">{r.campaignName}</div>
                      {r.campaignDesc && (
                        <div className="text-xs text-[#64748B] mt-0.5">{r.campaignDesc}</div>
                      )}
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[1,2,3,4,5].map((star) => (
                        <span key={star} className={`text-sm ${star <= r.rating ? "text-yellow-400" : "text-[#1E1E2E]"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#94A3B8]">{r.review}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-[#64748B]">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Kolkata" })}
                    </div>
                    {isOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleReviewPrivacy(r.id, "namePublic", !r.namePublic)}
                          className={`text-xs px-2 py-1 rounded-full border transition-colors ${r.namePublic ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" : "border-[#1E1E2E] text-[#64748B] bg-[#0D0D1A]"}`}
                        >
                          Campaign: {r.namePublic ? "Public" : "Private"}
                        </button>
                        <button
                          onClick={() => toggleReviewPrivacy(r.id, "reviewPublic", !r.reviewPublic)}
                          className={`text-xs px-2 py-1 rounded-full border transition-colors ${r.reviewPublic ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" : "border-[#1E1E2E] text-[#64748B] bg-[#0D0D1A]"}`}
                        >
                          Review: {r.reviewPublic ? "Public" : "Private"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        </>
        )}

      </div>


      {/* Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center sm:p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-[#1E1E2E] sm:rounded-2xl w-full sm:max-w-2xl sm:my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E1E2E]">
              <div>
                <h2 className="font-semibold text-[#F8FAFC]">Send Collaboration Proposal</h2>
                <p className="text-xs text-[#64748B] mt-0.5">To: {influencer.name} · Costs 10 credits</p>
              </div>
              <button onClick={() => setShowProposalModal(false)} className="text-[#64748B] hover:text-[#F8FAFC] text-xl leading-none">×</button>
            </div>

            {proposalSent ? (
              <div className="p-10 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <div className="text-[#F8FAFC] font-semibold mb-1">Proposal sent successfully!</div>
                <div className="text-sm text-[#64748B]">The influencer will be notified and can respond from their dashboard.</div>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4">
                {proposalError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{proposalError}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Campaign Title *</label>
                    <input value={proposalForm.campaignTitle} onChange={e => setProposalForm(p => ({ ...p, campaignTitle: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Summer Collection Launch" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Content Type *</label>
                    <select value={proposalForm.contentType} onChange={e => setProposalForm(p => ({ ...p, contentType: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500">
                      {CONTENT_TYPES.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Remuneration *</label>
                    <input value={proposalForm.remuneration} onChange={e => setProposalForm(p => ({ ...p, remuneration: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                      placeholder="e.g. ₹25,000 or Product + ₹10,000" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Timeline *</label>
                    <input value={proposalForm.timeline} onChange={e => setProposalForm(p => ({ ...p, timeline: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                      placeholder="e.g. 2 weeks" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Location</label>
                    <input value={proposalForm.location} onChange={e => setProposalForm(p => ({ ...p, location: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                      placeholder="Remote / Mumbai" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Start Date</label>
                    <input type="date" value={proposalForm.startDate} onChange={e => setProposalForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">End Date</label>
                    <input type="date" value={proposalForm.endDate} onChange={e => setProposalForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Revisions</label>
                    <input type="number" min={1} max={10} value={proposalForm.revisions} onChange={e => setProposalForm(p => ({ ...p, revisions: Number(e.target.value) }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Campaign Description *</label>
                    <textarea rows={3} value={proposalForm.description} onChange={e => setProposalForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Describe the campaign, brand goals, and what you're looking for..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Deliverables *</label>
                    <textarea rows={3} value={proposalForm.deliverables} onChange={e => setProposalForm(p => ({ ...p, deliverables: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="List exactly what you need — e.g. 2 Instagram Reels, 3 Stories, 1 bio link for 7 days" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Remuneration Details</label>
                    <textarea rows={2} value={proposalForm.remunerationDetails} onChange={e => setProposalForm(p => ({ ...p, remunerationDetails: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Payment terms, barter details, milestone payments, etc." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Additional Terms</label>
                    <textarea rows={2} value={proposalForm.additionalTerms} onChange={e => setProposalForm(p => ({ ...p, additionalTerms: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Usage rights, exclusivity window, content approval process, etc." />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <div
                      onClick={() => setProposalForm(p => ({ ...p, exclusivity: !p.exclusivity }))}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${proposalForm.exclusivity ? "bg-purple-600" : "bg-[#1E1E2E]"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${proposalForm.exclusivity ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-sm text-[#94A3B8]">Exclusivity required (influencer cannot work with competitors during campaign)</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowProposalModal(false)} className="flex-1 border border-[#1E1E2E] text-[#94A3B8] py-2.5 rounded-xl text-sm hover:bg-[#1E1E2E] transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={sendProposal}
                    disabled={proposalSending || !proposalForm.campaignTitle || !proposalForm.description || !proposalForm.deliverables || !proposalForm.timeline || !proposalForm.remuneration}
                    className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
                  >
                    {proposalSending ? "Sending..." : "Send Proposal — 10 credits"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  )
}
