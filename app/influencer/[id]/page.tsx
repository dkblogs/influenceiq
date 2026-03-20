"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import InsufficientCreditsError from "@/app/components/InsufficientCreditsError"

function firstName(name: string) {
  return name?.split(" ")[0] || name
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
  const loggedIn = status !== "loading" && !!session
  const params = useParams()
  const router = useRouter()
  const [influencer, setInfluencer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState("")
  const [credits, setCredits] = useState(0)
  const [aiScores, setAiScores] = useState<any>(null)
  const [scoring, setScoring] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [reviewsAvg, setReviewsAvg] = useState(0)
  const [followersPublic, setFollowersPublic] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio">("overview")
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [portfolioLoading, setPortfolioLoading] = useState(false)

  const colorMap: Record<string, string> = {
    PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
    VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
    MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
  }

  useEffect(() => {
    if (params.id) fetchInfluencer()
  }, [params.id])

  useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/user-credits?userId=${session.user.id}`)
      .then(res => res.json())
      .then(data => setCredits(data.credits))
  }, [session?.user?.id])

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

  async function handleUnlock() {
    if (!session) { router.push("/login"); return }
    setUnlocking(true)
    setError("")
    const res = await fetch("/api/unlock-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: params.id, userId: session.user.id }),
    })
    const data = await res.json()
    if (!res.ok) { setError(res.status === 402 ? "CREDITS" : (data.error || "Failed to unlock")); setUnlocking(false); return }
    setUnlocked(true)
    setCredits(data.newCredits)
    setInfluencer((prev: any) => ({ ...prev, email: data.email, phone: data.phone }))
    setUnlocking(false)
  }

  async function generateScore() {
    if (!session) { router.push("/login"); return }
    setScoring(true)
    const res = await fetch("/api/ai-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: params.id }),
    })
    const data = await res.json()
    if (data.success) { setAiScores(data.scores); setCredits((prev: number) => prev - 3) }
    else { setError(res.status === 402 ? "CREDITS" : (data.error || "Failed to generate score")) }
    setScoring(false)
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
  const tier2 = loggedIn && !unlocked
  const tier3 = loggedIn && unlocked
  const isOwner = !!(loggedIn && influencer?.userId && (session?.user as any)?.id === influencer.userId)

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
                  <>{influencer.location} · <span className="inline-flex items-center gap-1 text-[#64748B]">🔒 <span className="text-purple-400 text-xs">Unlock contact to view handle</span></span></>
                )}
                {tier3 && (
                  <>{influencer.handle} · {influencer.location}</>
                )}
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="text-sm bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">{influencer.niche}</span>
                <span className="text-sm bg-[#1E1E2E] text-[#94A3B8] px-3 py-1 rounded-full">{influencer.platform}</span>
                {(influencer.instagramHandle || influencer.instagramVerified) && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    influencer.instagramVerified
                      ? "bg-green-500/20 border border-green-500/40 text-green-300"
                      : "bg-[#1E1E2E] border border-[#1E1E2E] text-[#94A3B8]"
                  }`}>
                    {tier3
                      ? influencer.instagramHandle || "Instagram"
                      : "Instagram"}
                    {influencer.instagramVerified
                      ? <span className="text-green-400 text-xs">✓</span>
                      : tier3 && <span className="text-yellow-500 text-xs">⚠</span>}
                    {tier3 && influencer.instagramVerified && influencer.instagramFollowers
                      ? <span className="text-green-400/70 text-xs">· {influencer.instagramFollowers.toLocaleString()}</span>
                      : !tier3 && <span className="blur-sm select-none text-xs">••••</span>}
                  </span>
                )}
                {(influencer.youtubeHandle || influencer.youtubeVerified) && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    influencer.youtubeVerified
                      ? "bg-green-500/20 border border-green-500/40 text-green-300"
                      : "bg-[#1E1E2E] border border-[#1E1E2E] text-[#94A3B8]"
                  }`}>
                    {tier3
                      ? influencer.youtubeHandle || "YouTube"
                      : "YouTube"}
                    {influencer.youtubeVerified
                      ? <span className="text-green-400 text-xs">✓</span>
                      : tier3 && <span className="text-yellow-500 text-xs">⚠</span>}
                    {tier3 && influencer.youtubeVerified && influencer.youtubeFollowers
                      ? <span className="text-green-400/70 text-xs">· {influencer.youtubeFollowers.toLocaleString()}</span>
                      : !tier3 && <span className="blur-sm select-none text-xs">••••</span>}
                  </span>
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
              {tier2 && (
                <>
                  <div className="text-2xl text-[#334155]">🔒</div>
                  <div className="text-xs text-purple-400 mt-1">Get AI report</div>
                </>
              )}
              {tier3 && aiScores && (
                <>
                  <div className="text-3xl md:text-4xl font-bold text-purple-400">{aiScores.overallScore}</div>
                  <div className="text-xs text-[#64748B] mt-1">AI Score</div>
                </>
              )}
              {tier3 && !aiScores && (
                <>
                  <div className="text-2xl text-[#334155]">—</div>
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
                          {new Date(item.completedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
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
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 md:p-5 text-center">
              {followersPublic ? (
                <div className="text-xl md:text-2xl font-bold text-[#F8FAFC]">{influencer.followers}</div>
              ) : (
                <div className="text-sm text-[#64748B] flex flex-col items-center gap-1">
                  <span className="text-lg">🔒</span>
                  <span className="text-xs">Kept private</span>
                </div>
              )}
              <div className="text-xs md:text-sm text-[#64748B] mt-1">Followers</div>
            </div>
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 md:p-5 text-center">
              <div className="text-xl md:text-2xl font-bold text-[#F8FAFC]">{influencer.engagement}</div>
              <div className="text-xs md:text-sm text-[#64748B] mt-1">Engagement</div>
            </div>
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 md:p-5 text-center">
              <div className="text-xl md:text-2xl font-bold text-[#F8FAFC]">{influencer.rate}</div>
              <div className="text-xs md:text-sm text-[#64748B] mt-1">Avg. rate</div>
            </div>
          </div>
        )}

        {/* AI Score Breakdown */}
        {tier1 ? (
          <div className="mb-6">
            <SignupPromptCard />
          </div>
        ) : (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="font-semibold text-[#F8FAFC]">AI Score Breakdown</h2>
                <p className="text-xs text-[#64748B] mt-1">Powered by InfluenceIQ AI · Updated on demand</p>
              </div>
              <button
                onClick={generateScore}
                disabled={scoring}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors whitespace-nowrap shadow-lg shadow-purple-500/20"
              >
                {scoring ? "Analyzing..." : "Generate AI Score — 3 cr"}
              </button>
            </div>

            {aiScores ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Engagement Rate", value: aiScores.engagement, note: aiScores.engagementNote },
                    { label: "Audience Quality", value: aiScores.audienceQuality, note: aiScores.audienceQualityNote },
                    { label: "Content Consistency", value: aiScores.contentConsistency, note: aiScores.contentConsistencyNote },
                    { label: "Niche Authority", value: aiScores.nicheAuthority, note: aiScores.nicheAuthorityNote },
                    { label: "Growth Trend", value: aiScores.growthTrend, note: aiScores.growthTrendNote },
                    { label: "Brand Safety", value: aiScores.brandSafety, note: aiScores.brandSafetyNote },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#0D0D1A] rounded-xl p-4 border border-[#1E1E2E]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[#94A3B8]">{item.label}</span>
                        <span className="text-sm font-semibold text-purple-400">{item.value}</span>
                      </div>
                      <div className="h-2 bg-[#1E1E2E] rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${item.value}%` }}></div>
                      </div>
                      <p className="text-xs text-[#64748B]">{item.note}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-purple-400">{aiScores.overallScore}</span>
                    <span className="text-sm text-[#94A3B8]">Overall AI Score</span>
                  </div>
                  <p className="text-sm text-[#94A3B8]">{aiScores.summary}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#64748B]">
                <div className="text-4xl mb-3">⚡</div>
                <div className="font-medium text-[#94A3B8] mb-1">No AI score generated yet</div>
                <div className="text-sm">Click Generate AI Score to get a detailed breakdown — costs 3 credits</div>
              </div>
            )}
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
                <div className="flex items-center gap-3 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl">
                  <span className="text-lg">📱</span>
                  <div>
                    <div className="text-xs text-[#64748B] mb-0.5">Phone</div>
                    <div className="font-medium text-[#F8FAFC]">{influencer.phone}</div>
                  </div>
                </div>
                <div className="text-xs text-[#64748B] mt-2">
                  Contact details unlocked. Please use this information responsibly.
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[#94A3B8] mb-4">
                  Unlock this influencer's email and phone number to contact them directly.
                </p>
                {error && (
                  <div className="bg-red-500/10 px-4 py-3 rounded-lg mb-4 border border-red-500/20">
                    {error === "CREDITS"
                      ? <InsufficientCreditsError action="unlock this contact" />
                      : <span className="text-sm text-red-400">{error}</span>}
                  </div>
                )}
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
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
                >
                  {unlocking ? "Unlocking..." : "Unlock contact details — 5 credits"}
                </button>
              </div>
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
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
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
    </main>
  )
}
