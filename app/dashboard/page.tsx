"use client"
import { useSession } from "next-auth/react"
import Navbar from "@/app/components/Navbar"
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function loadCredits() {
      if (!session?.user?.id) return
      try {
        const res = await fetch(`/api/user-credits?userId=${(session.user as any).id}`)
        const data = await res.json()
        if (typeof data.credits === "number") {
          setCredits(data.credits)
        }
        setBrandVerified(data.brandVerified ?? false)
      } catch (err) {
        console.error("Failed to load credits:", err)
      }
    }
    loadCredits()

    const u = session?.user as any
    if (u?.role === "brand" && u?.id) {
      fetch(`/api/campaigns?brandId=${u.id}`)
        .then(res => res.json())
        .then(data => setBrandCampaigns(data.campaigns || []))
    }
  }, [session?.user?.id])

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
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            You are signed in as {user.role === "brand" ? "a Brand" : "an Influencer"} · {user.email}
          </p>
        </div>

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-[#12121A] rounded-2xl p-4 md:p-5 border border-[#1E1E2E]">
            <div className="text-sm text-[#94A3B8] mb-1">Credits remaining</div>
            <div className="text-2xl font-bold text-purple-400">{credits ?? "…"}</div>
            <div className="text-xs text-[#64748B] mt-1">Never expire</div>
          </div>
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
            <div className="text-2xl font-bold text-[#F8FAFC]">0</div>
            <div className="text-xs text-[#64748B] mt-1">Get one for 3 credits</div>
          </div>
        </div>

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
                <a href="/bio-writer" className="flex items-center gap-4 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all">
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
              <div className="text-5xl font-bold text-purple-400 mb-1">{credits ?? "…"}</div>
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
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Profile views</span>
                      <span className="text-[#F8FAFC] font-medium">{Math.floor((credits || 0) / 5)}x</span>
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
