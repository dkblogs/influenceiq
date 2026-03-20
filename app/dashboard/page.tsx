"use client"
import { useSession } from "next-auth/react"
import Navbar from "@/app/components/Navbar"
import InsufficientCreditsError from "@/app/components/InsufficientCreditsError"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl transition-colors ${star <= (hovered || value) ? "text-yellow-400" : "text-[#1E1E2E]"}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >★</button>
      ))}
    </div>
  )
}

function ReviewModal({ campaign, onClose, onSubmit }: {
  campaign: any
  onClose: () => void
  onSubmit: (data: any) => void
}) {
  const [influencerSearch, setInfluencerSearch] = useState("")
  const [influencerResults, setInfluencerResults] = useState<any[]>([])
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function searchInfluencers(q: string) {
    if (q.length < 2) { setInfluencerResults([]); return }
    const res = await fetch(`/api/influencers?search=${encodeURIComponent(q)}`)
    const data = await res.json()
    setInfluencerResults((data.influencers || []).slice(0, 5))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedInfluencer) { setError("Please select an influencer"); return }
    if (!rating) { setError("Please select a star rating"); return }
    setSubmitting(true)
    setError("")
    await onSubmit({
      campaignId: campaign.id,
      influencerId: selectedInfluencer.id,
      rating,
      review,
      campaignName: campaign.title,
      campaignDesc: campaign.description,
      namePublic: true,
      reviewPublic: true,
    })
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 w-full max-w-md shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#F8FAFC]">Rate Influencer</h3>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#F8FAFC] text-xl leading-none transition-colors">×</button>
        </div>
        <div className="text-xs text-[#64748B] mb-4 bg-[#0A0A0F] px-3 py-2 rounded-lg border border-[#1E1E2E]">{campaign.title}</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Influencer search */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1">Influencer</label>
            {selectedInfluencer ? (
              <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-lg">
                <span className="text-sm text-purple-300 font-medium">{selectedInfluencer.name}</span>
                <button type="button" className="text-xs text-[#64748B] hover:text-[#F8FAFC] transition-colors" onClick={() => setSelectedInfluencer(null)}>Change</button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search influencer name..."
                  value={influencerSearch}
                  onChange={(e) => { setInfluencerSearch(e.target.value); searchInfluencers(e.target.value) }}
                  className="w-full border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
                />
                {influencerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-[#12121A] border border-[#1E1E2E] rounded-lg mt-1 shadow-xl z-10">
                    {influencerResults.map((inf) => (
                      <button
                        key={inf.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#1E1E2E] flex items-center gap-2 transition-colors"
                        onClick={() => { setSelectedInfluencer(inf); setInfluencerResults([]); setInfluencerSearch("") }}
                      >
                        <span className="font-medium text-[#F8FAFC]">{inf.name}</span>
                        <span className="text-[#64748B] text-xs">{inf.niche}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1">Review <span className="text-[#64748B] font-normal">(optional)</span></label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Describe the collaboration..."
              rows={3}
              className="w-full border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-[#1E1E2E] text-[#94A3B8] py-2.5 rounded-lg text-sm hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [credits, setCredits] = useState<number | null>(null)
  const [brandVerified, setBrandVerified] = useState<boolean | null>(null)
  const [brandCampaigns, setBrandCampaigns] = useState<any[]>([])
  const [reviewModal, setReviewModal] = useState<any>(null)
  const [reviewSuccess, setReviewSuccess] = useState("")
  // Portfolio state (influencer only)
  const [myInfluencerProfile, setMyInfluencerProfile] = useState<any>(null)
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [portfolioToast, setPortfolioToast] = useState("")
  const [portfolioError, setPortfolioError] = useState("")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [aiReport, setAiReport] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [aiReportsCount, setAiReportsCount] = useState(0)
  const [campaignApplicationCount, setCampaignApplicationCount] = useState<number | null>(null)
  const [collaborationRequestCount, setCollaborationRequestCount] = useState<number | null>(null)
  const [portfolioForm, setPortfolioForm] = useState({
    brandName: "", campaignTitle: "", description: "",
    deliverables: "", results: "", mediaUrl: "", completedAt: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status !== "authenticated") return

    const u = session?.user as any
    if (!u?.id) return

    async function loadDashboard() {
      setLoading(true)
      try {
        const [creditsRes, influencerRes, statsRes, brandCampaignsRes] = await Promise.all([
          fetch(`/api/user-credits?userId=${u.id}`),
          u.role === "influencer" ? fetch(`/api/influencers?userId=${u.id}`) : Promise.resolve(null),
          u.role === "influencer" ? fetch(`/api/influencer-stats`) : Promise.resolve(null),
          u.role === "brand" ? fetch(`/api/campaigns?brandId=${u.id}`) : Promise.resolve(null),
        ])

        const creditsData = await creditsRes.json()
        if (typeof creditsData.credits === "number") setCredits(creditsData.credits)
        setBrandVerified(creditsData.brandVerified ?? false)

        if (influencerRes) {
          const influencerData = await influencerRes.json()
          const inf = (influencerData.influencers || [])[0] ?? null
          setMyInfluencerProfile(inf)
          if (inf?.aiReportFull) {
            try { setAiReport(JSON.parse(inf.aiReportFull)) } catch {}
          }
          if (inf?.id) {
            const portfolioRes = await fetch(`/api/portfolio?influencerId=${inf.id}`)
            const portfolioData = await portfolioRes.json()
            setPortfolioItems(portfolioData.items || [])
          }
        }

        if (statsRes) {
          const statsData = await statsRes.json()
          if (typeof statsData.campaignApplicationCount === "number") setCampaignApplicationCount(statsData.campaignApplicationCount)
          if (typeof statsData.collaborationRequestCount === "number") setCollaborationRequestCount(statsData.collaborationRequestCount)
        }

        if (brandCampaignsRes) {
          const brandCampaignsData = await brandCampaignsRes.json()
          setBrandCampaigns(brandCampaignsData.campaigns || [])
        }
      } catch (error) {
        console.error("Dashboard load error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [session?.user?.id, session?.user?.role, status])

  function showToast(msg: string) {
    setPortfolioToast(msg)
    setTimeout(() => setPortfolioToast(""), 3000)
  }

  async function handlePortfolioAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!myInfluencerProfile?.id) { setPortfolioError("No influencer profile linked to your account"); return }
    setPortfolioError("")
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...portfolioForm, influencerId: myInfluencerProfile.id }),
    })
    const data = await res.json()
    if (!res.ok) { setPortfolioError(data.error || "Failed to add item"); return }
    setPortfolioItems(prev => [data.item, ...prev])
    setPortfolioForm({ brandName: "", campaignTitle: "", description: "", deliverables: "", results: "", mediaUrl: "", completedAt: "" })
    setShowAddForm(false)
    showToast("Collaboration added!")
  }

  async function handlePortfolioDelete(id: string) {
    if (!confirm("Delete this portfolio item?")) return
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" })
    if (res.ok) {
      setPortfolioItems(prev => prev.filter(i => i.id !== id))
      showToast("Deleted.")
    }
  }

  async function handlePortfolioEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingItem) return
    const res = await fetch(`/api/portfolio/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingItem),
    })
    const data = await res.json()
    if (!res.ok) { setPortfolioError(data.error || "Failed to update"); return }
    setPortfolioItems(prev => prev.map(i => i.id === data.item.id ? data.item : i))
    setEditingItem(null)
    showToast("Updated!")
  }

  async function handleGenerateAiReport() {
    if (!myInfluencerProfile?.id) return
    setAiLoading(true)
    setAiError("")
    setAiReport(null)
    const res = await fetch("/api/ai-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: myInfluencerProfile.id }),
    })
    const data = await res.json()
    setAiLoading(false)
    if (!res.ok) {
      setAiError(res.status === 402 ? "CREDITS" : (data.error || "Failed to generate report"))
      return
    }
    setAiReport(data.report)
    setAiReportsCount(c => c + 1)
    setMyInfluencerProfile((p: any) => ({
      ...p,
      score: data.report.score,
      aiScore: data.report.score,
      aiReportSummary: data.report.summary,
      aiReportGeneratedAt: new Date().toISOString(),
    }))
  }

  async function handleReviewSubmit(data: any) {
    const res = await fetch("/api/campaign-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, brandId: (session?.user as any)?.id }),
    })
    const result = await res.json()
    if (!res.ok) {
      alert(result.error || "Failed to submit review")
    } else {
      setReviewSuccess(`Review submitted for ${reviewModal?.title}`)
      setReviewModal(null)
    }
  }

  if (status === "loading") return null

  if (!session) return null

  const user = session.user as { name?: string | null; email?: string | null; id?: string; role?: string }
  const initial = user.name ? user.name[0].toUpperCase() : "U"

  return (
    <main className="min-h-screen bg-[#0A0A0F]">

      <Navbar />

      <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">

        {/* Welcome */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F8FAFC] flex flex-wrap items-center gap-2">
            <span>Welcome back, {user.name} 👋</span>
            {myInfluencerProfile?.verified && (
              <span className="inline-flex items-center gap-1 text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full px-2 py-0.5 ml-2">
                ✓ Verified
              </span>
            )}
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            You are signed in as {user.role === "brand" ? "a Brand" : "an Influencer"} · {user.email}
          </p>
        </div>

        {/* Influencer handle verification status */}
        {user.role === "influencer" && myInfluencerProfile !== null && (() => {
          const igOk = myInfluencerProfile?.instagramVerified
          const ytOk = myInfluencerProfile?.youtubeVerified
          if (!igOk && !ytOk) {
            return (
              <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
                <span className="text-base mt-0.5">⚠️</span>
                <span>
                  No verified social handles. <a href="/profile" className="underline hover:text-yellow-300 font-medium">Go to Profile to verify your Instagram or YouTube handle</a> to unlock AI Score.
                </span>
              </div>
            )
          }
          return (
            <div className="mb-6 flex items-center gap-3 flex-wrap">
              {igOk && (
                <span className="flex items-center gap-1.5 text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-3 py-1.5 rounded-full font-medium">
                  ✓ Instagram Verified
                </span>
              )}
              {ytOk && (
                <span className="flex items-center gap-1.5 text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-3 py-1.5 rounded-full font-medium">
                  ✓ YouTube Verified
                </span>
              )}
            </div>
          )
        })()}

        {/* Brand verification banner */}
        {user.role === "brand" && brandVerified !== null && (
          brandVerified ? (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-sm text-[#10B981]">
              <span className="text-base">✓</span>
              <span>Your brand is verified. Influencers can trust your campaigns.</span>
            </div>
          ) : (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
              <span className="text-base">⚠️</span>
              <span>Your brand is not verified yet. Verification builds trust with influencers. <a href="/verify-brand" className="text-amber-400 underline hover:text-amber-300">Apply for verification →</a></span>
            </div>
          )
        )}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E] animate-pulse">
                <div className="h-3 bg-[#1E1E2E] rounded w-3/4 mb-3" />
                <div className="h-8 bg-[#1E1E2E] rounded w-1/2 mb-2" />
                <div className="h-2.5 bg-[#1E1E2E] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E]">
              <div className="text-sm text-[#94A3B8] mb-1">Credits remaining</div>
              <div className="text-2xl font-bold text-purple-400">{credits ?? 0}</div>
              <div className="text-xs text-[#64748B] mt-1">Never expire</div>
            </div>
            {user.role === "brand" ? (
              <>
                <div className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E]">
                  <div className="text-sm text-[#94A3B8] mb-1">Influencers unlocked</div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">0</div>
                  <div className="text-xs text-[#64748B] mt-1">Unlock for 5 credits</div>
                </div>
                <div className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E]">
                  <div className="text-sm text-[#94A3B8] mb-1">Proposals sent</div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">0</div>
                  <div className="text-xs text-[#64748B] mt-1">Send for 10 credits</div>
                </div>
                <div className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E]">
                  <div className="text-sm text-[#94A3B8] mb-1">AI reports</div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">{aiReportsCount}</div>
                  <div className="text-xs text-[#64748B] mt-1">Get one for 3 credits</div>
                </div>
              </>
            ) : (
              <>
                <a href="/dashboard/campaigns-applied" className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E] hover:border-purple-500/30 transition-colors block">
                  <div className="text-sm text-[#94A3B8] mb-1">Campaigns applied</div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">{campaignApplicationCount ?? 0}</div>
                  <div className="text-xs text-purple-400 mt-1">View history →</div>
                </a>
                <div className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E]">
                  <div className="text-sm text-[#94A3B8] mb-1">Collaboration requests</div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">{collaborationRequestCount ?? 0}</div>
                  <div className="text-xs text-[#64748B] mt-1">Sent by you</div>
                </div>
                <a
                  href={myInfluencerProfile?.id ? `/report/${myInfluencerProfile.id}` : "#"}
                  className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E] hover:border-purple-500/30 transition-colors block"
                >
                  <div className="text-sm text-[#94A3B8] mb-1">AI reports generated</div>
                  <div className="text-2xl font-bold text-[#F8FAFC]">
                    {myInfluencerProfile?.aiReportGeneratedAt ? 1 + aiReportsCount : aiReportsCount}
                  </div>
                  <div className="text-xs text-purple-400 mt-1">View report →</div>
                </a>
              </>
            )}
          </div>
        )}

        {/* AI Score — influencers only */}
        {user.role === "influencer" && (
          <div className="mb-6 bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
            <h2 className="font-medium text-[#F8FAFC] mb-1">Your AI Score</h2>
            <p className="text-xs text-[#64748B] mb-5">AI-analysed score based on your verified social data</p>

            {/* No handle verified */}
            {myInfluencerProfile && !myInfluencerProfile.instagramVerified && !myInfluencerProfile.youtubeVerified && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
                ⚠️ Verify a social handle first to generate your AI Score.
                <a href="/profile" className="underline ml-1 hover:text-amber-200">Go to Profile →</a>
              </div>
            )}

            {/* Handle verified, no report yet */}
            {myInfluencerProfile && (myInfluencerProfile.instagramVerified || myInfluencerProfile.youtubeVerified) && !aiReport && !aiLoading && (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🤖</div>
                <div className="text-sm text-[#94A3B8] mb-1">
                  Get an AI-powered analysis of your influence,<br />engagement, and brand readiness
                </div>
                <div className="text-xs text-[#64748B] mb-4">Costs 1 credit</div>
                <button
                  onClick={handleGenerateAiReport}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                >
                  Generate AI Score
                </button>
              </div>
            )}

            {/* Loading */}
            {aiLoading && (
              <div className="flex items-center justify-center gap-3 py-6 text-purple-400 text-sm">
                <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analyzing your profile...
              </div>
            )}

            {/* Error */}
            {aiError && (
              <div className="bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20 mb-4">
                {aiError === "CREDITS"
                  ? <InsufficientCreditsError action="generate AI report" />
                  : <span className="text-sm text-red-400">{aiError}</span>}
              </div>
            )}

            {/* Report exists */}
            {aiReport && (
              <div>
                <div className="flex items-center gap-5 mb-5">
                  {(() => {
                    const s = aiReport.score
                    const hex = s >= 70 ? "#10B981" : s >= 40 ? "#FBBF24" : "#F87171"
                    const ringClass = s >= 70 ? "stroke-[#10B981]" : s >= 40 ? "stroke-yellow-400" : "stroke-red-400"
                    const pct = (s / 100) * 251.2
                    return (
                      <div className="relative flex-shrink-0">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#1E1E2E" strokeWidth="8" />
                          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8"
                            strokeDasharray={`${pct} 251.2`} strokeLinecap="round" className={ringClass} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold" style={{ color: hex }}>{s}</span>
                        </div>
                      </div>
                    )
                  })()}
                  <div>
                    <div className="text-sm text-[#F8FAFC] font-medium mb-1">
                      {aiReport.score >= 70 ? "Strong profile" : aiReport.score >= 40 ? "Room to grow" : "Needs improvement"}
                    </div>
                    <div className="text-xs text-[#94A3B8] leading-relaxed">{aiReport.summary}</div>
                  </div>
                </div>

                {aiReport.strengths?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {aiReport.strengths.map((s: string, i: number) => (
                      <span key={i} className="bg-[#10B981]/10 text-[#10B981] text-xs px-3 py-1 rounded-full border border-[#10B981]/20">{s}</span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`/report/${myInfluencerProfile?.id}`}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                  >
                    View Full Report →
                  </a>
                  <button
                    onClick={handleGenerateAiReport}
                    disabled={aiLoading}
                    className="border border-[#1E1E2E] text-[#94A3B8] px-4 py-2 rounded-lg text-sm hover:border-purple-500/30 hover:text-[#F8FAFC] transition-colors disabled:opacity-50"
                  >
                    Regenerate (1 credit)
                  </button>
                  {myInfluencerProfile?.aiReportGeneratedAt && (
                    <span className="text-xs text-[#64748B]">
                      Last generated {new Date(myInfluencerProfile.aiReportGeneratedAt).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Get started */}
          <div className="lg:col-span-2 bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
            <h2 className="font-medium text-[#F8FAFC] mb-4">Get started</h2>
            <div className="space-y-3">
              <a href={user.role === "brand" ? "/discover" : "/brands"} className="flex items-center gap-4 p-3 rounded-xl border border-[#1E1E2E] hover:bg-[#1E1E2E] hover:border-purple-500/30 transition-all">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🔍</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#F8FAFC]">
                    {user.role === "brand" ? "Browse influencers" : "Browse brands"}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {user.role === "brand" ? "Search by niche, platform, location — free" : "Find brands looking for your niche — free"}
                  </div>
                </div>
                <span className="text-xs text-purple-400 font-medium whitespace-nowrap">Browse →</span>
              </a>
              <a href="/campaigns" className="flex items-center gap-4 p-3 rounded-xl border border-[#1E1E2E] hover:bg-[#1E1E2E] hover:border-purple-500/30 transition-all">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📋</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#F8FAFC]">Open campaigns</div>
                  <div className="text-xs text-[#64748B]">
                    {user.role === "brand" ? "Post a campaign — 15 credits" : "Apply to campaigns — 2 credits each"}
                  </div>
                </div>
                <span className="text-xs text-purple-400 font-medium whitespace-nowrap">View →</span>
              </a>
              {user.role === "brand" ? (
                <a href="/recommend" className="flex items-center gap-4 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🤖</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#F8FAFC]">AI Influencer Recommendations</div>
                    <div className="text-xs text-[#64748B]">Describe your campaign · get your best matches · free</div>
                  </div>
                  <span className="text-xs text-purple-400 font-medium whitespace-nowrap">Try →</span>
                </a>
              ) : (
                <a href="/profile#bio" className="flex items-center gap-4 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-lg flex-shrink-0">✍️</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#F8FAFC]">AI Bio Writer</div>
                    <div className="text-xs text-[#64748B]">Get a professional bio for your media kit · free</div>
                  </div>
                  <span className="text-xs text-purple-400 font-medium whitespace-nowrap">Try →</span>
                </a>
              )}
              <a href="/pricing" className="flex items-center gap-4 p-3 rounded-xl border border-[#1E1E2E] hover:bg-[#1E1E2E] hover:border-purple-500/30 transition-all">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-lg flex-shrink-0">💳</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#F8FAFC]">Buy more credits</div>
                  <div className="text-xs text-[#64748B]">Starter ₹499 · Growth ₹1,499 · Agency ₹3,999</div>
                </div>
                <span className="text-xs text-purple-400 font-medium whitespace-nowrap">Buy →</span>
              </a>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
            <h2 className="font-medium text-[#F8FAFC] mb-4">Your credits</h2>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-purple-400 mb-1">{loading ? <span className="inline-block w-16 h-10 bg-[#1E1E2E] rounded animate-pulse" /> : (credits ?? 0)}</div>
              <div className="text-sm text-[#64748B] mb-6">credits remaining</div>
              <a href="/pricing" className="block w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 text-center transition-colors shadow-lg shadow-purple-500/20">
                Buy credits
              </a>
            </div>
            <div className="border-t border-[#1E1E2E] pt-4 mt-2">
              <div className="text-xs font-medium text-[#94A3B8] mb-3">What you can do</div>
              <div className="space-y-2">
                {user.role === "brand" ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Unlock contacts</span>
                      <span className="text-[#F8FAFC] font-medium">{Math.floor((credits || 0) / 5)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">AI reports</span>
                      <span className="text-[#F8FAFC] font-medium">{Math.floor((credits || 0) / 3)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Proposals</span>
                      <span className="text-[#F8FAFC] font-medium">{Math.floor((credits || 0) / 10)}x</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Campaign applications</span>
                      <span className="text-[#F8FAFC] font-medium">{Math.floor((credits || 0) / 2)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Send requests</span>
                      <span className="text-[#F8FAFC] font-medium">{Math.floor((credits || 0) / 10)}x</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Rate Influencers — brands only */}
        {(session?.user as any)?.role === "brand" && (
          <div className="mt-6 bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
            <h2 className="font-medium text-[#F8FAFC] mb-1">Rate Influencers</h2>
            <p className="text-xs text-[#64748B] mb-4">Leave a review for influencers you've worked with</p>

            {reviewSuccess && (
              <div className="bg-[#10B981]/10 text-[#10B981] text-sm px-4 py-3 rounded-lg mb-4 border border-[#10B981]/20">{reviewSuccess}</div>
            )}

            {brandCampaigns.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm">No campaigns yet. <a href="/campaigns" className="text-purple-400 hover:underline">Post a campaign</a> to start working with influencers.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {brandCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between gap-4 p-3 border border-[#1E1E2E] rounded-xl hover:border-purple-500/30 transition-colors">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#F8FAFC] truncate">{campaign.title}</div>
                      <div className="text-xs text-[#64748B]">{campaign.niche} · {campaign.platform} · {campaign.status}</div>
                    </div>
                    <button
                      onClick={() => { setReviewSuccess(""); setReviewModal(campaign) }}
                      className="flex-shrink-0 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-500 transition-colors"
                    >
                      Rate Influencer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Portfolio — influencers only */}
        {user.role === "influencer" && (
          <div className="mt-6 bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-medium text-[#F8FAFC]">My Portfolio</h2>
              <button
                onClick={() => { setShowAddForm(v => !v); setPortfolioError("") }}
                className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-500 transition-colors"
              >
                {showAddForm ? "Cancel" : "+ Add Collaboration"}
              </button>
            </div>
            <p className="text-xs text-[#64748B] mb-4">Showcase your past brand collaborations to attract more opportunities.</p>

            {portfolioToast && (
              <div className="bg-[#10B981]/10 text-[#10B981] text-sm px-4 py-3 rounded-lg mb-4 border border-[#10B981]/20">{portfolioToast}</div>
            )}
            {portfolioError && (
              <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg mb-4 border border-red-500/20">{portfolioError}</div>
            )}

            {/* Add form */}
            {showAddForm && (
              <form onSubmit={handlePortfolioAdd} className="bg-[#0D0D1A] border border-[#1E1E2E] rounded-xl p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Brand Name *</label>
                    <input required value={portfolioForm.brandName} onChange={e => setPortfolioForm(p => ({...p, brandName: e.target.value}))}
                      placeholder="e.g. Nike, Zomato" className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Campaign Title *</label>
                    <input required value={portfolioForm.campaignTitle} onChange={e => setPortfolioForm(p => ({...p, campaignTitle: e.target.value}))}
                      placeholder="e.g. Diwali Product Launch" className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Description</label>
                  <textarea value={portfolioForm.description} onChange={e => setPortfolioForm(p => ({...p, description: e.target.value}))}
                    placeholder="What was the campaign about?" rows={2} className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Deliverables</label>
                    <input value={portfolioForm.deliverables} onChange={e => setPortfolioForm(p => ({...p, deliverables: e.target.value}))}
                      placeholder="e.g. 3 Reels, 5 Stories" className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Results</label>
                    <input value={portfolioForm.results} onChange={e => setPortfolioForm(p => ({...p, results: e.target.value}))}
                      placeholder="e.g. 2M reach, 8% engagement" className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Media URL</label>
                    <input type="url" value={portfolioForm.mediaUrl} onChange={e => setPortfolioForm(p => ({...p, mediaUrl: e.target.value}))}
                      placeholder="https://instagram.com/p/..." className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Completion Date</label>
                    <input type="date" value={portfolioForm.completedAt} onChange={e => setPortfolioForm(p => ({...p, completedAt: e.target.value}))}
                      className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-[#64748B] hover:text-[#94A3B8] px-3 py-1.5 transition-colors">Cancel</button>
                  <button type="submit" className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-500 transition-colors">Save Collaboration</button>
                </div>
              </form>
            )}

            {/* Items list */}
            {portfolioItems.length === 0 && !showAddForm ? (
              <div className="text-center py-8 text-[#64748B]">
                <div className="text-3xl mb-2">📂</div>
                <div className="text-sm">No portfolio items yet. Add your first collaboration above.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {portfolioItems.map((item) => (
                  <div key={item.id}>
                    {editingItem?.id === item.id ? (
                      <form onSubmit={handlePortfolioEdit} className="bg-[#0D0D1A] border border-purple-500/30 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#94A3B8] mb-1">Brand Name *</label>
                            <input required value={editingItem.brandName} onChange={e => setEditingItem((p: any) => ({...p, brandName: e.target.value}))}
                              className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#94A3B8] mb-1">Campaign Title *</label>
                            <input required value={editingItem.campaignTitle} onChange={e => setEditingItem((p: any) => ({...p, campaignTitle: e.target.value}))}
                              className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#94A3B8] mb-1">Description</label>
                          <textarea value={editingItem.description || ""} onChange={e => setEditingItem((p: any) => ({...p, description: e.target.value}))}
                            rows={2} className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500 resize-none" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#94A3B8] mb-1">Deliverables</label>
                            <input value={editingItem.deliverables || ""} onChange={e => setEditingItem((p: any) => ({...p, deliverables: e.target.value}))}
                              className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#94A3B8] mb-1">Results</label>
                            <input value={editingItem.results || ""} onChange={e => setEditingItem((p: any) => ({...p, results: e.target.value}))}
                              className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#94A3B8] mb-1">Media URL</label>
                            <input type="url" value={editingItem.mediaUrl || ""} onChange={e => setEditingItem((p: any) => ({...p, mediaUrl: e.target.value}))}
                              className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#94A3B8] mb-1">Completion Date</label>
                            <input type="date" value={editingItem.completedAt ? new Date(editingItem.completedAt).toISOString().split("T")[0] : ""}
                              onChange={e => setEditingItem((p: any) => ({...p, completedAt: e.target.value}))}
                              className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button type="button" onClick={() => setEditingItem(null)} className="text-sm text-[#64748B] hover:text-[#94A3B8] px-3 py-1.5 transition-colors">Cancel</button>
                          <button type="submit" className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-500 transition-colors">Save Changes</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-start justify-between gap-3 p-3 border border-[#1E1E2E] rounded-xl hover:border-purple-500/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-purple-400 font-medium">{item.brandName}</div>
                          <div className="text-sm font-medium text-[#F8FAFC] truncate">{item.campaignTitle}</div>
                          {item.results && <div className="text-xs text-[#10B981] mt-0.5 truncate">{item.results}</div>}
                          {item.completedAt && (
                            <div className="text-xs text-[#64748B] mt-0.5">
                              {new Date(item.completedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => { setEditingItem({...item}); setPortfolioError("") }}
                            className="text-xs border border-[#1E1E2E] text-[#94A3B8] px-2.5 py-1 rounded-lg hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handlePortfolioDelete(item.id)}
                            className="text-xs border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {myInfluencerProfile && (
              <div className="mt-4 pt-4 border-t border-[#1E1E2E]">
                <a href={`/portfolio/${myInfluencerProfile.id}`} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  View public portfolio page →
                </a>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Review modal */}
      {reviewModal && (
        <ReviewModal
          campaign={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

    </main>
  )
}
