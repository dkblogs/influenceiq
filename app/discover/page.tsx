"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const niches = ["All", "Food", "Tech", "Fitness", "Finance", "Fashion", "Travel", "Gaming"]
const platforms = ["All", "Instagram", "YouTube", "LinkedIn"]

function firstName(name: string) {
  return name?.split(" ")[0] || name
}

function LockedField({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
      🔒{" "}
      <a href="/login" className="text-purple-600 hover:underline" onClick={e => e.stopPropagation()}>
        Sign in to view
      </a>
    </span>
  )
}

export default function Discover() {
  const { data: session, status } = useSession()
  const loggedIn = status !== "loading" && !!session

  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNiche, setSelectedNiche] = useState("All")
  const [selectedPlatform, setSelectedPlatform] = useState("All")
  const [search, setSearch] = useState("")
  const [bookmarks, setBookmarks] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const colorMap = {
    PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
    VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
    MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
  }

  useEffect(() => {
    fetchInfluencers()
  }, [selectedNiche, selectedPlatform, search])

  async function fetchInfluencers() {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedNiche !== "All") params.set("niche", selectedNiche)
    if (selectedPlatform !== "All") params.set("platform", selectedPlatform)
    if (search) params.set("search", search)
    const res = await fetch(`/api/influencers?${params}`)
    const data = await res.json()
    setInfluencers(data.influencers || [])
    setLoading(false)
  }

  function toggleBookmark(id) {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

  function handleCardClick(id: string) {
    window.location.href = loggedIn ? `/influencer/${id}` : "/login"
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
        </a>
        <div className="hidden md:flex items-center gap-4">
          <a href="/discover" className="text-sm text-purple-600 font-medium">Find Influencers</a>
          <a href="/brands" className="text-sm text-gray-500 hover:text-gray-900">Find Brands</a>
          <a href="/campaigns" className="text-sm text-gray-500 hover:text-gray-900">Campaigns</a>
          {loggedIn
            ? <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Dashboard</a>
            : <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Sign in</a>
          }
        </div>
        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <span className="block w-5 h-0.5 bg-gray-600"></span>
          <span className="block w-5 h-0.5 bg-gray-600"></span>
          <span className="block w-5 h-0.5 bg-gray-600"></span>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 py-4 flex flex-col gap-3 z-40">
          <a href="/discover" className="text-sm text-purple-600 font-medium py-2 border-b border-gray-50">Find Influencers</a>
          <a href="/brands" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Brands</a>
          <a href="/campaigns" className="text-sm text-gray-600 py-2 border-b border-gray-50">Campaigns</a>
          {loggedIn
            ? <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center">Dashboard</a>
            : <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center">Sign in</a>
          }
        </div>
      )}

      <div className="px-3 md:px-8 py-8 md:py-10 max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">Find Influencers</h1>
        <p className="text-gray-500 mb-8">Browse AI-scored influencers. Free to search and filter.</p>

        {/* Sign-in nudge for guests */}
        {!loggedIn && status !== "loading" && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-purple-800">
              🔒 <strong>Sign in free</strong> to see full names, handles, stats, AI scores and contact details.
            </p>
            <a href="/signup" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 whitespace-nowrap text-center">
              Create free account
            </a>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
            placeholder="Search by name, niche, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loggedIn && bookmarks.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700 whitespace-nowrap">
              🔖 {bookmarks.length} saved
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Niche</div>
          <div className="flex gap-2 flex-wrap">
            {niches.map((n) => (
              <button key={n} onClick={() => setSelectedNiche(n)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedNiche === n ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Platform</div>
          <div className="flex gap-2 flex-wrap">
            {platforms.map((p) => (
              <button key={p} onClick={() => setSelectedPlatform(p)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedPlatform === p ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-400 mb-4">
          {loading ? "Loading..." : `Showing ${influencers.length} influencer${influencers.length !== 1 ? "s" : ""}`}
          {selectedNiche !== "All" && ` in ${selectedNiche}`}
          {selectedPlatform !== "All" && ` on ${selectedPlatform}`}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className="border border-gray-100 rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium text-gray-600 mb-1">No influencers found</div>
            <div className="text-sm">Try a different niche or platform</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((inf) => (
              <div
                key={inf.id}
                onClick={() => handleCardClick(inf.id)}
                className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${colorMap[inf.initials] || "bg-purple-500"} flex items-center justify-center text-white font-medium flex-shrink-0`}>
                      {inf.initials}
                    </div>
                    <div>
                      {/* Name: first name always visible, full name locked */}
                      <div className="flex items-center gap-1 mb-0.5">
                        {loggedIn ? (
                          <>
                            <span className="font-medium text-gray-900 text-sm">{inf.name}</span>
                            {inf.verified && <span className="text-blue-500 text-xs">✓</span>}
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-gray-900 text-sm">{firstName(inf.name)}</span>
                            {inf.verified && <span className="text-blue-500 text-xs">✓</span>}
                          </>
                        )}
                      </div>
                      {/* Handle: locked for guests */}
                      <div className="text-xs text-gray-400 mb-1">
                        {loggedIn ? (
                          <>{inf.handle} · {inf.location}</>
                        ) : (
                          <>{inf.location} · <LockedField label="handle" /></>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{inf.niche}</span>
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{inf.platform}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Score: locked for guests */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {loggedIn ? (
                      <div className="text-center">
                        <div className="text-xl font-semibold text-purple-600">{inf.score}</div>
                        <div className="text-xs text-gray-400">AI Score</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-xl text-gray-300">🔒</div>
                        <div className="text-xs text-gray-400">AI Score</div>
                      </div>
                    )}
                    {loggedIn && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(inf.id) }}
                        className={`text-lg transition-transform hover:scale-110 ${bookmarks.includes(inf.id) ? "text-purple-600" : "text-gray-300"}`}
                      >
                        🔖
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                {loggedIn ? (
                  <div className="grid grid-cols-3 gap-1 mb-4">
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
                ) : (
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {["Followers", "Engagement", "Avg. rate"].map((label) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                          <span>🔒</span>
                          <span className="text-purple-600">Sign in</span>
                        </div>
                        <div className="text-xs text-gray-400">{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {loggedIn ? (
                  <div className="flex flex-col gap-2">
                    <a
                      href={`/influencer/${inf.id}`}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors text-center"
                    >
                      Unlock contact — 5 cr
                    </a>
                    <button className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                      AI report — 3 cr
                    </button>
                  </div>
                ) : (
                  <a
                    href="/login"
                    onClick={e => e.stopPropagation()}
                    className="w-full block text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium"
                  >
                    Sign in to view profile
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
