"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const hardcodedCampaigns = [
  { id: "seed-1", brand: "FreshKart", brandInitials: "FK", brandColor: "bg-orange-500", title: "Summer grocery launch campaign", description: "Looking for food and lifestyle influencers to promote our new summer grocery collection. Must create 2 Instagram reels and 3 stories.", niche: "Food", platform: "Instagram", budget: "₹15,000", deadline: "15 days left", applicants: 12, slots: 3, location: "Pan India", minFollowers: "10K", status: "Open" },
  { id: "seed-2", brand: "ZenFit", brandInitials: "ZF", brandColor: "bg-green-500", title: "App launch — fitness influencers needed", description: "Promote our new AI fitness app to your audience. Create 1 YouTube video and 2 Instagram posts showing the app in action.", niche: "Fitness", platform: "YouTube + Instagram", budget: "₹25,000", deadline: "20 days left", applicants: 8, slots: 2, location: "Mumbai, Delhi, Bangalore", minFollowers: "25K", status: "Open" },
  { id: "seed-3", brand: "PayEasy", brandInitials: "PE", brandColor: "bg-blue-500", title: "Finance creator collab — fintech app", description: "Seeking finance and tech creators to explain our payment solution to small business owners.", niche: "Finance", platform: "LinkedIn + YouTube", budget: "₹40,000", deadline: "30 days left", applicants: 5, slots: 4, location: "Pan India", minFollowers: "15K", status: "Open" },
  { id: "seed-4", brand: "StyleHub", brandInitials: "SH", brandColor: "bg-pink-500", title: "Festive collection showcase", description: "We need fashion influencers to showcase our new festive ethnic wear collection. 3 Instagram reels required. Products will be provided.", niche: "Fashion", platform: "Instagram", budget: "₹20,000", deadline: "10 days left", applicants: 24, slots: 5, location: "Mumbai, Delhi", minFollowers: "20K", status: "Open" },
  { id: "seed-5", brand: "EduLearn", brandInitials: "EL", brandColor: "bg-yellow-500", title: "Study tips YouTube collab", description: "Partner with us to create study tips and exam prep content. Full creative freedom.", niche: "Education", platform: "YouTube", budget: "₹12,000", deadline: "25 days left", applicants: 7, slots: 3, location: "Pan India", minFollowers: "5K", status: "Open" },
  { id: "seed-6", brand: "FoodBox", brandInitials: "FB", brandColor: "bg-red-500", title: "Healthy snack unboxing campaign", description: "Create an unboxing video or reel of our healthy snack subscription box. Box will be sent to your address.", niche: "Food", platform: "Instagram + YouTube", budget: "₹8,000", deadline: "12 days left", applicants: 18, slots: 6, location: "Pan India", minFollowers: "5K", status: "Open" },
]

const niches = ["All", "Food", "Fitness", "Finance", "Fashion", "Education", "Tech"]
const platforms = ["All", "Instagram", "YouTube", "LinkedIn"]

export default function Campaigns() {
  const { data: session } = useSession()
  const [selectedNiche, setSelectedNiche] = useState("All")
  const [selectedPlatform, setSelectedPlatform] = useState("All")
  const [search, setSearch] = useState("")
  const [applied, setApplied] = useState<string[]>([])
  const [credits, setCredits] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user-credits?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => setCredits(data.credits))
      fetch(`/api/campaigns`)
        .then(res => res.json())
        .then(data => setDbCampaigns(data.campaigns || []))
    }
  }, [session])

  const allCampaigns = [...hardcodedCampaigns, ...dbCampaigns]

  const filtered = allCampaigns.filter((c) => {
    const matchNiche = selectedNiche === "All" || c.niche === selectedNiche
    const matchPlatform = selectedPlatform === "All" || c.platform.includes(selectedPlatform)
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.brand?.toLowerCase().includes(search.toLowerCase()) ||
      c.niche.toLowerCase().includes(search.toLowerCase())
    return matchNiche && matchPlatform && matchSearch
  })

  async function handleApply(campaignId: string) {
    if (!session) {
      window.location.href = "/login"
      return
    }
    setError("")

    if (applied.includes(campaignId)) return

    const res = await fetch("/api/apply-campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, userId: session.user.id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      return
    }

    setApplied([...applied, campaignId])
    setCredits(data.newCredits)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#1E1E2E] sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md z-50">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold text-[#F8FAFC]">Influence<span className="text-purple-400">IQ</span></span>
        </a>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <a href="/discover" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Find Influencers</a>
          <a href="/brands" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Find Brands</a>
          <a href="/campaigns" className="text-sm text-purple-400 font-medium">Open Campaigns</a>
          {session && credits !== null && (
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-purple-400 font-medium">{credits} credits</span>
            </div>
          )}
          <a href="/post-campaign" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">Post Campaign</a>
        </div>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-[#94A3B8]"></span>
          <span className="block w-5 h-0.5 bg-[#94A3B8]"></span>
          <span className="block w-5 h-0.5 bg-[#94A3B8]"></span>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E1E2E] bg-[#0A0A0F] px-4 py-4 flex flex-col gap-3 z-40">
          <a href="/discover" className="text-sm text-[#94A3B8] py-2 border-b border-[#1E1E2E]">Find Influencers</a>
          <a href="/brands" className="text-sm text-[#94A3B8] py-2 border-b border-[#1E1E2E]">Find Brands</a>
          <a href="/campaigns" className="text-sm text-purple-400 font-medium py-2 border-b border-[#1E1E2E]">Open Campaigns</a>
          {session && credits !== null && (
            <div className="text-xs text-purple-400 font-medium py-1">{credits} credits</div>
          )}
          <a href="/post-campaign" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center hover:bg-purple-500">Post Campaign</a>
        </div>
      )}

      <div className="px-4 md:px-8 py-8 md:py-10 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-block bg-orange-500/10 text-orange-400 text-xs px-3 py-1 rounded-full mb-3 border border-orange-500/20">For Influencers</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC] mb-1">Open Campaigns</h1>
            <p className="text-[#94A3B8] text-sm">Brands actively looking for influencers. Apply directly — 2 credits per application.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg mb-6 border border-red-500/20">
            {error}
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
          <div className="text-xs text-[#64748B] mb-2 font-medium uppercase tracking-wide">Niche</div>
          <div className="flex gap-2 flex-wrap">
            {niches.map((n) => (
              <button key={n} onClick={() => setSelectedNiche(n)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedNiche === n ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs text-[#64748B] mb-2 font-medium uppercase tracking-wide">Platform</div>
          <div className="flex gap-2 flex-wrap">
            {platforms.map((p) => (
              <button key={p} onClick={() => setSelectedPlatform(p)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedPlatform === p ? "bg-[#F8FAFC] text-[#0A0A0F]" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-[#64748B] mb-4">
          {filtered.length} open campaign{filtered.length !== 1 ? "s" : ""} found
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-medium text-[#94A3B8] mb-1">No campaigns found</div>
            <div className="text-sm">Try a different niche or platform</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <div key={c.id} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4 md:p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
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
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">📱 {c.platform}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">👥 Min. {c.minFollowers}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">🎯 {c.slots} slots</div>
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">{c.niche}</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApply(c.id)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                          applied.includes(c.id)
                            ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                            : "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20"
                        }`}
                      >
                        {applied.includes(c.id) ? "✓ Applied" : "Apply now — 2 credits"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
