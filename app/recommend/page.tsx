"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"

const niches = ["Any", "Food", "Tech", "Fitness", "Finance", "Fashion", "Travel", "Gaming", "Education", "Lifestyle", "Health", "Beauty"]
const platforms = ["Any", "Instagram", "YouTube", "LinkedIn", "X (Twitter)"]
const budgets = ["Under ₹10,000", "₹10,000 – ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "Above ₹1,00,000", "Flexible"]

const colorMap: Record<string, string> = {
  PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
  VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
  MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
}

function matchColor(score: number) {
  if (score >= 85) return { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" }
  if (score >= 70) return { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" }
  return { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500" }
}

export default function Recommend() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [product, setProduct] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [goal, setGoal] = useState("")
  const [budget, setBudget] = useState("Flexible")
  const [platform, setPlatform] = useState("Any")
  const [niche, setNiche] = useState("Any")

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setResult(null)
    setLoading(true)

    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, targetAudience, goal, budget, platform, niche }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      return
    }
    setResult(data)
  }

  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
        </a>
        <div className="hidden md:flex items-center gap-4">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">Find Influencers</a>
          <a href="/campaigns" className="text-sm text-gray-500 hover:text-gray-900">Campaigns</a>
          <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Dashboard</a>
        </div>
        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="block w-5 h-0.5 bg-gray-600"></span>
          <span className="block w-5 h-0.5 bg-gray-600"></span>
          <span className="block w-5 h-0.5 bg-gray-600"></span>
        </button>
      </nav>
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <a href="/discover" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Influencers</a>
          <a href="/campaigns" className="text-sm text-gray-600 py-2 border-b border-gray-50">Campaigns</a>
          <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center">Dashboard</a>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
            AI-Powered · Free to use
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">AI Influencer Recommendations</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Describe your campaign and our AI will analyse all available influencers to find your best matches — with reasons.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm mb-8">
          <div className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What product or brand are you promoting? <span className="text-red-400">*</span>
              </label>
              <input
                value={product}
                onChange={e => setProduct(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                placeholder="e.g. ZenFit — an AI-powered fitness tracking app"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who is your target audience? <span className="text-red-400">*</span>
              </label>
              <input
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                placeholder="e.g. Urban Indians aged 22–35 interested in health and fitness"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign goal</label>
              <input
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                placeholder="e.g. Drive app downloads, increase brand awareness, launch new product"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <select
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                >
                  {budgets.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niche <span className="text-red-400">*</span>
                </label>
                <select
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                >
                  {niches.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                >
                  {platforms.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analysing influencers…
                </>
              ) : (
                "Find my best matches →"
              )}
            </button>

          </div>
        </form>

        {/* Results */}
        {result && (
          <div>
            {/* AI strategy note */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">⚡</span>
                <div>
                  <p className="text-sm font-medium text-purple-900 mb-1">AI Strategy Note</p>
                  <p className="text-sm text-purple-700 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top {result.recommendations?.length} matches for your campaign
            </h2>

            <div className="space-y-4">
              {result.recommendations?.map((inf: any, i: number) => {
                const colors = matchColor(inf.matchScore)
                const initials = inf.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                const avatarColor = colorMap[initials] || "bg-purple-500"

                return (
                  <div key={inf.id || i} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all">
                    {/* Top row */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="font-medium text-gray-900">{inf.name}</span>
                          <span className="text-sm text-gray-400">{inf.handle}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{inf.niche}</span>
                          <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{inf.platform}</span>
                          <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{inf.followers} followers</span>
                          {inf.engagement && (
                            <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{inf.engagement} engagement</span>
                          )}
                        </div>
                      </div>
                      {/* Scores */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">{inf.score}</div>
                          <div className="text-xs text-gray-400">AI Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Match score bar */}
                    <div className={`${colors.bg} rounded-lg px-4 py-3 mb-3`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-semibold ${colors.text}`}>Campaign match</span>
                        <span className={`text-sm font-bold ${colors.text}`}>{inf.matchScore}%</span>
                      </div>
                      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
                          style={{ width: `${inf.matchScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{inf.matchReason}</p>

                    {/* Suggested approach */}
                    <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2.5 mb-4">
                      <span className="text-base mt-0.5">💡</span>
                      <p className="text-xs text-gray-500 leading-relaxed">{inf.suggestedApproach}</p>
                    </div>

                    <a
                      href={`/influencer/${inf.id}`}
                      className="inline-block bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      View profile →
                    </a>
                  </div>
                )
              })}
            </div>

            {/* Re-run */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setResult(null)}
                className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
              >
                Start a new search
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
