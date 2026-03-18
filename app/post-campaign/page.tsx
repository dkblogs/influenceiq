"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PostCampaign() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [niche, setNiche] = useState("")
  const [platform, setPlatform] = useState("")
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("30 days")
  const [slots, setSlots] = useState("1")
  const [minFollowers, setMinFollowers] = useState("5K")
  const [location, setLocation] = useState("Pan India")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) {
      router.push("/login")
      return
    }
    setError("")
    setLoading(true)

    const res = await fetch("/api/post-campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        title,
        description,
        niche,
        platform,
        budget,
        deadline,
        slots,
        minFollowers,
        location,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push("/campaigns?posted=true")
  }

  const inputClass = "w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
  const selectClass = "w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#94A3B8]"
  const labelClass = "block text-sm font-medium text-[#94A3B8] mb-1"

  return (
    <main className="min-h-screen bg-[#0A0A0F]">

      {/* Navigation */}
      <nav className="bg-[#0A0A0F]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#1E1E2E]">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold text-[#F8FAFC]">Influence<span className="text-purple-400">IQ</span></span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/campaigns" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">← Back</a>
          {session && (
            <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
              Dashboard
            </a>
          )}
        </div>
      </nav>

      <div className="px-4 md:px-8 py-8 md:py-12 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1 rounded-full mb-3 border border-cyan-500/20">For Brands</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC] mb-2">Post a Campaign</h1>
          <p className="text-[#94A3B8] text-sm">Reach thousands of influencers actively looking for brand partnerships. Costs 15 credits.</p>
        </div>

        {!session ? (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="font-semibold text-[#F8FAFC] mb-2">Sign in to post a campaign</h2>
            <p className="text-[#94A3B8] text-sm mb-6">You need an account to post campaigns.</p>
            <a href="/login" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
              Sign in
            </a>
          </div>
        ) : (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 md:p-8">

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg mb-6 border border-red-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className={labelClass}>Campaign title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Summer collection launch — fashion influencers needed"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe what you need — deliverables, timeline, product details..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Niche</label>
                  <select value={niche} onChange={(e) => setNiche(e.target.value)} className={selectClass} required>
                    <option value="">Select niche</option>
                    <option>Food</option>
                    <option>Tech</option>
                    <option>Fitness</option>
                    <option>Finance</option>
                    <option>Fashion</option>
                    <option>Travel</option>
                    <option>Gaming</option>
                    <option>Education</option>
                    <option>Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Platform</label>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={selectClass} required>
                    <option value="">Select platform</option>
                    <option>Instagram</option>
                    <option>YouTube</option>
                    <option>LinkedIn</option>
                    <option>X (Twitter)</option>
                    <option>Instagram + YouTube</option>
                    <option>All platforms</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Campaign budget</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. ₹10,000 – ₹25,000"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Deadline</label>
                  <select value={deadline} onChange={(e) => setDeadline(e.target.value)} className={selectClass}>
                    <option>7 days</option>
                    <option>15 days</option>
                    <option>30 days</option>
                    <option>45 days</option>
                    <option>60 days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Slots available</label>
                  <input
                    type="number"
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                    className={inputClass}
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className={labelClass}>Min. followers</label>
                  <select value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} className={selectClass}>
                    <option>1K</option>
                    <option>5K</option>
                    <option>10K</option>
                    <option>25K</option>
                    <option>50K</option>
                    <option>100K</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectClass}>
                    <option>Pan India</option>
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Bangalore</option>
                    <option>Chennai</option>
                    <option>Hyderabad</option>
                    <option>Pune</option>
                    <option>Kolkata</option>
                  </select>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-sm text-purple-300">
                Posting this campaign will deduct <strong>15 credits</strong> from your balance.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
              >
                {loading ? "Posting campaign..." : "Post campaign — 15 credits"}
              </button>

            </form>
          </div>
        )}
      </div>

      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-8 text-center text-sm text-[#64748B] mt-8">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}
