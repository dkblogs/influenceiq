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

  async function handleSubmit(e) {
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

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navigation */}
      <nav className="bg-white flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/campaigns" className="text-sm text-gray-500 hover:text-gray-900">← Back</a>
          {session && (
            <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Dashboard
            </a>
          )}
        </div>
      </nav>

      <div className="px-4 md:px-8 py-8 md:py-12 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full mb-3">For Brands</div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Post a Campaign</h1>
          <p className="text-gray-500 text-sm">Reach thousands of influencers actively looking for brand partnerships. Costs 15 credits.</p>
        </div>

        {!session ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="font-semibold text-gray-900 mb-2">Sign in to post a campaign</h2>
            <p className="text-gray-500 text-sm mb-6">You need an account to post campaigns.</p>
            <a href="/login" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700">
              Sign in
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8">

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  placeholder="e.g. Summer collection launch — fashion influencers needed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 h-32 resize-none"
                  placeholder="Describe what you need — deliverables, timeline, product details..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                    required
                  >
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                    required
                  >
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign budget</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                    placeholder="e.g. ₹10,000 – ₹25,000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <select
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                  >
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slots available</label>
                  <input
                    type="number"
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. followers</label>
                  <select
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                  >
                    <option>1K</option>
                    <option>5K</option>
                    <option>10K</option>
                    <option>25K</option>
                    <option>50K</option>
                    <option>100K</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                  >
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

              <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-700">
                Posting this campaign will deduct <strong>15 credits</strong> from your balance.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Posting campaign..." : "Post campaign — 15 credits"}
              </button>

            </form>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-100 px-4 md:px-8 py-8 text-center text-sm text-gray-400 mt-8">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}
