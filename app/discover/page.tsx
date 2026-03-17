"use client"
import { useState } from "react"

const allInfluencers = [
  { name: "Priya Sharma", handle: "@priyaeats", location: "Mumbai", niche: "Food", platform: "Instagram", followers: "84K", engagement: "6.2%", score: 91, rate: "₹8,000", initials: "PS", color: "bg-purple-500" },
  { name: "Rohit Kumar", handle: "@rohittech", location: "Bangalore", niche: "Tech", platform: "YouTube", followers: "210K", engagement: "4.8%", score: 87, rate: "₹25,000", initials: "RK", color: "bg-orange-500" },
  { name: "Ananya Nair", handle: "@ananyafits", location: "Delhi", niche: "Fitness", platform: "Instagram", followers: "42K", engagement: "8.1%", score: 79, rate: "₹4,000", initials: "AN", color: "bg-green-500" },
  { name: "Vikram Mehta", handle: "@vikramfinance", location: "Chennai", niche: "Finance", platform: "LinkedIn", followers: "38K", engagement: "5.4%", score: 84, rate: "₹6,000", initials: "VM", color: "bg-yellow-500" },
  { name: "Sneha Patel", handle: "@snehastyle", location: "Ahmedabad", niche: "Fashion", platform: "Instagram", followers: "95K", engagement: "7.3%", score: 88, rate: "₹12,000", initials: "SP", color: "bg-pink-500" },
  { name: "Arjun Das", handle: "@arjuntravels", location: "Kolkata", niche: "Travel", platform: "YouTube", followers: "156K", engagement: "5.9%", score: 82, rate: "₹18,000", initials: "AD", color: "bg-blue-500" },
  { name: "Meera Iyer", handle: "@meeracooks", location: "Hyderabad", niche: "Food", platform: "Instagram", followers: "62K", engagement: "7.8%", score: 86, rate: "₹7,500", initials: "MI", color: "bg-red-500" },
  { name: "Karan Singh", handle: "@karangames", location: "Pune", niche: "Gaming", platform: "YouTube", followers: "320K", engagement: "3.9%", score: 80, rate: "₹30,000", initials: "KS", color: "bg-indigo-500" },
  { name: "Divya Rao", handle: "@divyabeauty", location: "Bangalore", niche: "Fashion", platform: "Instagram", followers: "78K", engagement: "6.8%", score: 85, rate: "₹9,000", initials: "DR", color: "bg-teal-500" },
]

const niches = ["All", "Food", "Tech", "Fitness", "Finance", "Fashion", "Travel", "Gaming"]
const platforms = ["All", "Instagram", "YouTube", "LinkedIn"]

export default function Discover() {
  const [selectedNiche, setSelectedNiche] = useState("All")
  const [selectedPlatform, setSelectedPlatform] = useState("All")
  const [search, setSearch] = useState("")
  const [bookmarks, setBookmarks] = useState([])

  const filtered = allInfluencers.filter((inf) => {
    const matchNiche = selectedNiche === "All" || inf.niche === selectedNiche
    const matchPlatform = selectedPlatform === "All" || inf.platform === selectedPlatform
    const matchSearch = inf.name.toLowerCase().includes(search.toLowerCase()) ||
      inf.handle.toLowerCase().includes(search.toLowerCase()) ||
      inf.location.toLowerCase().includes(search.toLowerCase())
    return matchNiche && matchPlatform && matchSearch
  })

  function toggleBookmark(handle) {
    setBookmarks((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/discover" className="text-sm text-purple-600 font-medium">Find Influencers</a>
          <a href="/join" className="text-sm text-gray-500 hover:text-gray-900">For Influencers</a>
          <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Get Started</a>
        </div>
      </nav>

      <div className="px-8 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">Find Influencers</h1>
        <p className="text-gray-500 mb-8">Browse AI-scored influencers. Free to search and filter.</p>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
            placeholder="Search by name, handle, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {bookmarks.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
              🔖 {bookmarks.length} saved
            </div>
          )}
        </div>

        {/* Niche filters */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Niche</div>
          <div className="flex gap-2 flex-wrap">
            {niches.map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedNiche === n
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Platform filters */}
        <div className="mb-8">
          <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Platform</div>
          <div className="flex gap-2 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedPlatform === p
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-400 mb-4">
          Showing {filtered.length} influencer{filtered.length !== 1 ? "s" : ""}
          {selectedNiche !== "All" && ` in ${selectedNiche}`}
          {selectedPlatform !== "All" && ` on ${selectedPlatform}`}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium text-gray-600 mb-1">No influencers found</div>
            <div className="text-sm">Try a different niche or platform</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filtered.map((inf) => (
              <div key={inf.handle} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${inf.color} flex items-center justify-center text-white font-medium`}>
                      {inf.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{inf.name}</div>
                      <div className="text-xs text-gray-400">{inf.handle} · {inf.location}</div>
                      <div className="flex gap-1 mt-1">
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{inf.niche}</span>
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{inf.platform}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-center">
                      <div className="text-xl font-semibold text-purple-600">{inf.score}</div>
                      <div className="text-xs text-gray-400">AI Score</div>
                    </div>
                    <button
                      onClick={() => toggleBookmark(inf.handle)}
                      className={`text-lg transition-transform hover:scale-110 ${bookmarks.includes(inf.handle) ? "text-purple-600" : "text-gray-300"}`}
                    >
                      🔖
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{inf.followers}</div>
                    <div className="text-xs text-gray-400">Followers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{inf.engagement}</div>
                    <div className="text-xs text-gray-400">Engagement</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{inf.rate}</div>
                    <div className="text-xs text-gray-400">Avg. rate</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors">
                    Unlock contact — 5 cr
                  </button>
                  <button className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                    AI report — 3 cr
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}