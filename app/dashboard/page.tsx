"use client"
import { useSession, signOut } from "next-auth/react"
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
          className={`text-2xl transition-colors ${star <= (hovered || value) ? "text-yellow-400" : "text-gray-200"}`}
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
  const [namePublic, setNamePublic] = useState(true)
  const [reviewPublic, setReviewPublic] = useState(true)
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
      namePublic,
      reviewPublic,
    })
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Rate Influencer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="text-xs text-gray-400 mb-4 bg-gray-50 px-3 py-2 rounded-lg">{campaign.title}</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Influencer search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Influencer</label>
            {selectedInfluencer ? (
              <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-purple-700 font-medium">{selectedInfluencer.name}</span>
                <button type="button" className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setSelectedInfluencer(null)}>Change</button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search influencer name..."
                  value={influencerSearch}
                  onChange={(e) => { setInfluencerSearch(e.target.value); searchInfluencers(e.target.value) }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                {influencerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10">
                    {influencerResults.map((inf) => (
                      <button
                        key={inf.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => { setSelectedInfluencer(inf); setInfluencerResults([]); setInfluencerSearch("") }}
                      >
                        <span className="font-medium text-gray-900">{inf.name}</span>
                        <span className="text-gray-400 text-xs">{inf.niche}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Describe the collaboration..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-600">Make campaign name public</span>
              <div
                className={`w-10 h-5 rounded-full transition-colors relative ${namePublic ? "bg-purple-600" : "bg-gray-200"}`}
                onClick={() => setNamePublic(!namePublic)}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${namePublic ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-600">Make review public</span>
              <div
                className={`w-10 h-5 rounded-full transition-colors relative ${reviewPublic ? "bg-purple-600" : "bg-gray-200"}`}
                onClick={() => setReviewPublic(!reviewPublic)}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${reviewPublic ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </label>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
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
  const [credits, setCredits] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [brandCampaigns, setBrandCampaigns] = useState<any[]>([])
  const [reviewModal, setReviewModal] = useState<any>(null)
  const [reviewSuccess, setReviewSuccess] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user-credits?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => setCredits(data.credits))
      const u = session.user as any
      if (u.role === "brand") {
        fetch(`/api/campaigns?brandId=${session.user.id}`)
          .then(res => res.json())
          .then(data => setBrandCampaigns(data.campaigns || []))
      }
    }
  }, [session])

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

  if (status === "loading" || credits === null) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  if (!session) return null

  const user = session.user as { name?: string | null; email?: string | null; id?: string; role?: string }
  const initial = user.name ? user.name[0].toUpperCase() : "U"

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navigation */}
      <nav className="bg-white flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">
            Influence<span className="text-purple-600">IQ</span>
          </span>
        </a>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">Find Influencers</a>
          <a href="/brands" className="text-sm text-gray-500 hover:text-gray-900">Find Brands</a>
          <a href="/campaigns" className="text-sm text-gray-500 hover:text-gray-900">Campaigns</a>
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-purple-600 font-medium">{credits} credits</span>
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {initial}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Sign out
          </button>
        </div>
        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-3">
          <div className="bg-purple-50 px-2 py-1 rounded-lg">
            <span className="text-xs text-purple-600 font-medium">{credits} cr</span>
          </div>
          <button
            className="flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-gray-600"></span>
            <span className="block w-5 h-0.5 bg-gray-600"></span>
            <span className="block w-5 h-0.5 bg-gray-600"></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <a href="/discover" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Influencers</a>
          <a href="/brands" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Brands</a>
          <a href="/campaigns" className="text-sm text-gray-600 py-2 border-b border-gray-50">Campaigns</a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-red-500 py-2 text-left"
          >
            Sign out
          </button>
        </div>
      )}

      <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">

        {/* Welcome */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            You are signed in as {user.role === "brand" ? "a Brand" : "an Influencer"} · {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Credits remaining</div>
            <div className="text-2xl font-semibold text-purple-600">{credits}</div>
            <div className="text-xs text-gray-400 mt-1">Never expire</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Influencers unlocked</div>
            <div className="text-2xl font-semibold text-gray-900">0</div>
            <div className="text-xs text-gray-400 mt-1">Unlock for 5 credits</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Proposals sent</div>
            <div className="text-2xl font-semibold text-gray-900">0</div>
            <div className="text-xs text-gray-400 mt-1">Send for 10 credits</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">AI reports</div>
            <div className="text-2xl font-semibold text-gray-900">0</div>
            <div className="text-xs text-gray-400 mt-1">Get one for 3 credits</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Get started */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Get started</h2>
            <div className="space-y-3">
              <a href={user.role === "brand" ? "/discover" : "/brands"} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🔍</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {user.role === "brand" ? "Browse influencers" : "Browse brands"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.role === "brand" ? "Search by niche, platform, location — free" : "Find brands looking for your niche — free"}
                  </div>
                </div>
                <span className="text-xs text-purple-600 font-medium whitespace-nowrap">Browse →</span>
              </a>
              <a href="/campaigns" className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📋</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Open campaigns</div>
                  <div className="text-xs text-gray-400">
                    {user.role === "brand" ? "Post a campaign — 15 credits" : "Apply to campaigns — 2 credits each"}
                  </div>
                </div>
                <span className="text-xs text-purple-600 font-medium whitespace-nowrap">View →</span>
              </a>
              {user.role === "brand" ? (
                <a href="/recommend" className="flex items-center gap-4 p-3 rounded-lg border border-purple-100 bg-purple-50/40 hover:bg-purple-50 transition-colors">
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🤖</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">AI Influencer Recommendations</div>
                    <div className="text-xs text-gray-400">Describe your campaign · get your best matches · free</div>
                  </div>
                  <span className="text-xs text-purple-600 font-medium whitespace-nowrap">Try →</span>
                </a>
              ) : (
                <a href="/bio-writer" className="flex items-center gap-4 p-3 rounded-lg border border-purple-100 bg-purple-50/40 hover:bg-purple-50 transition-colors">
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0">✍️</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">AI Bio Writer</div>
                    <div className="text-xs text-gray-400">Get a professional bio for your media kit · free</div>
                  </div>
                  <span className="text-xs text-purple-600 font-medium whitespace-nowrap">Try →</span>
                </a>
              )}
              <a href="/pricing" className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">💳</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Buy more credits</div>
                  <div className="text-xs text-gray-400">Starter ₹499 · Growth ₹1,499 · Agency ₹3,999</div>
                </div>
                <span className="text-xs text-purple-600 font-medium whitespace-nowrap">Buy →</span>
              </a>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Your credits</h2>
            <div className="text-center py-4">
              <div className="text-5xl font-semibold text-purple-600 mb-1">{credits}</div>
              <div className="text-sm text-gray-400 mb-6">credits remaining</div>
              <a href="/pricing" className="block w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 text-center">
                Buy credits
              </a>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="text-xs font-medium text-gray-500 mb-3">What you can do</div>
              <div className="space-y-2">
                {user.role === "brand" ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Unlock contacts</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 5)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">AI reports</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 3)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Proposals</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 10)}x</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Campaign applications</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 2)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Send requests</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 10)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Profile views</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 5)}x</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Rate Influencers — brands only */}
        {(session?.user as any)?.role === "brand" && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-medium text-gray-900 mb-1">Rate Influencers</h2>
            <p className="text-xs text-gray-400 mb-4">Leave a review for influencers you've worked with</p>

            {reviewSuccess && (
              <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">{reviewSuccess}</div>
            )}

            {brandCampaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm">No campaigns yet. <a href="/campaigns" className="text-purple-600 hover:underline">Post a campaign</a> to start working with influencers.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {brandCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between gap-4 p-3 border border-gray-100 rounded-lg">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{campaign.title}</div>
                      <div className="text-xs text-gray-400">{campaign.niche} · {campaign.platform} · {campaign.status}</div>
                    </div>
                    <button
                      onClick={() => { setReviewSuccess(""); setReviewModal(campaign) }}
                      className="flex-shrink-0 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
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
