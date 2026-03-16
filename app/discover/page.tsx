export default function Discover() {
  const influencers = [
    { name: "Priya Sharma", handle: "@priyaeats", location: "Mumbai", niche: "Food", platform: "Instagram", followers: "84K", engagement: "6.2%", score: 91, rate: "₹8,000", initials: "PS", color: "bg-purple-500" },
    { name: "Rohit Kumar", handle: "@rohittech", location: "Bangalore", niche: "Tech", platform: "YouTube", followers: "210K", engagement: "4.8%", score: 87, rate: "₹25,000", initials: "RK", color: "bg-orange-500" },
    { name: "Ananya Nair", handle: "@ananyafits", location: "Delhi", niche: "Fitness", platform: "Instagram", followers: "42K", engagement: "8.1%", score: 79, rate: "₹4,000", initials: "AN", color: "bg-green-500" },
    { name: "Vikram Mehta", handle: "@vikramfinance", location: "Chennai", niche: "Finance", platform: "LinkedIn", followers: "38K", engagement: "5.4%", score: 84, rate: "₹6,000", initials: "VM", color: "bg-yellow-500" },
    { name: "Sneha Patel", handle: "@snehastyle", location: "Ahmedabad", niche: "Fashion", platform: "Instagram", followers: "95K", engagement: "7.3%", score: 88, rate: "₹12,000", initials: "SP", color: "bg-pink-500" },
    { name: "Arjun Das", handle: "@arjuntravels", location: "Kolkata", niche: "Travel", platform: "YouTube", followers: "156K", engagement: "5.9%", score: 82, rate: "₹18,000", initials: "AD", color: "bg-blue-500" },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">
            Influence<span className="text-purple-600">IQ</span>
          </span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/discover" className="text-sm text-purple-600 font-medium">Find Influencers</a>
          <a href="/join" className="text-sm text-gray-500 hover:text-gray-900">For Influencers</a>
          <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Get Started</a>
        </div>
      </nav>

      <div className="px-8 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Find Influencers</h1>
        <p className="text-gray-500 mb-8">Browse AI-scored influencers across all platforms. Free to search.</p>

        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <input
            className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
            placeholder="Search by name, niche, or location..."
          />
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none">
            <option>All platforms</option>
            <option>Instagram</option>
            <option>YouTube</option>
            <option>Facebook</option>
            <option>LinkedIn</option>
            <option>X</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none">
            <option>All niches</option>
            <option>Food</option>
            <option>Tech</option>
            <option>Fashion</option>
            <option>Finance</option>
            <option>Fitness</option>
            <option>Travel</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none">
            <option>All sizes</option>
            <option>Nano (1K–10K)</option>
            <option>Micro (10K–100K)</option>
            <option>Macro (100K+)</option>
          </select>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            Search
          </button>
        </div>

        {/* Influencer Grid */}
        <div className="grid grid-cols-3 gap-6">
          {influencers.map((inf) => (
            <div key={inf.handle} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
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
                <div className="text-center">
                  <div className="text-xl font-semibold text-purple-600">{inf.score}</div>
                  <div className="text-xs text-gray-400">AI Score</div>
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
                <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700">
                  Unlock contact — 5 cr
                </button>
                <button className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-xs hover:bg-gray-50">
                  AI report — 3 cr
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}