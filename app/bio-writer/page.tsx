"use client"
import { useState } from "react"
import Navbar from "@/app/components/Navbar"

const niches = ["Food", "Tech", "Fitness", "Finance", "Fashion", "Travel", "Gaming", "Education", "Lifestyle", "Health", "Beauty", "Parenting", "Automobile", "Comedy"]
const platforms = ["Instagram", "YouTube", "LinkedIn", "X (Twitter)", "Instagram + YouTube", "Multiple platforms"]
const styles = [
  "Informative & Educational",
  "Funny & Entertaining",
  "Aspirational & Inspirational",
  "Raw & Authentic",
  "Aesthetic & Visual",
  "Conversational & Relatable",
  "Professional & Expert",
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
        copied
          ? "bg-green-50 text-green-600 border border-green-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
      }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  )
}

export default function BioWriter() {
  const [name, setName] = useState("")
  const [niche, setNiche] = useState("Fitness")
  const [platform, setPlatform] = useState("Instagram")
  const [location, setLocation] = useState("")
  const [achievements, setAchievements] = useState("")
  const [style, setStyle] = useState("Raw & Authentic")

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setResult(null)
    setLoading(true)

    const res = await fetch("/api/bio-writer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, niche, platform, location, achievements, style }),
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

      <Navbar />

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
            AI-Powered · Free to use
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">AI Bio Writer</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Answer 5 quick questions and get a professional bio in 3 lengths — ready to paste into your profile, media kit, or pitch deck.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${result ? "lg:grid-cols-2" : ""} gap-8 items-start`}>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm">

            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">5</div>
              <span className="text-sm font-medium text-gray-700">questions · takes ~1 minute</span>
            </div>

            <div className="space-y-5">

              {/* Q1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1. What is your name? <span className="text-red-400">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>

              {/* Q2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    2. Your content niche <span className="text-red-400">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    3. Primary platform <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600"
                  >
                    {platforms.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Q3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  4. Any achievements, stats, or highlights?
                </label>
                <textarea
                  value={achievements}
                  onChange={e => setAchievements(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 h-24 resize-none"
                  placeholder="e.g. 84K followers, 6.2% engagement rate, featured in Times Food, collaborated with FreshKart and ZenFit, viral reel with 2M views"
                />
                <p className="text-xs text-gray-400 mt-1">Include follower count, engagement, brand collabs, viral moments — anything that makes you stand out.</p>
              </div>

              {/* Q4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">5. Your content style</label>
                <div className="flex flex-wrap gap-2">
                  {styles.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        style === s
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  placeholder="e.g. Mumbai, India"
                />
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
                    Writing your bio…
                  </>
                ) : (
                  "Generate my bio →"
                )}
              </button>

            </div>
          </form>

          {/* Results */}
          {result && (
            <div className="space-y-4">

              <h2 className="text-lg font-semibold text-gray-900">Your professional bios</h2>

              {/* Short */}
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Short</span>
                    <span className="text-xs text-gray-400 ml-2">Instagram · Twitter bio field</span>
                  </div>
                  <CopyButton text={result.short} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-4 py-3">{result.short}</p>
                <p className="text-xs text-gray-400 mt-1.5">{result.short?.length} chars</p>
              </div>

              {/* Medium */}
              <div className="border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Medium</span>
                    <span className="text-xs text-gray-400 ml-2">Platform profiles · Media kit</span>
                  </div>
                  <CopyButton text={result.medium} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-4 py-3">{result.medium}</p>
                <p className="text-xs text-gray-400 mt-1.5">{result.medium?.length} chars</p>
              </div>

              {/* Long */}
              <div className="border border-purple-100 rounded-xl p-5 bg-purple-50/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Full bio</span>
                    <span className="text-xs text-gray-400 ml-2">Media kit · Collaboration pitch</span>
                  </div>
                  <CopyButton text={result.long} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-white/70 rounded-lg px-4 py-3">{result.long}</p>
                <p className="text-xs text-gray-400 mt-1.5">{result.long?.length} chars</p>
              </div>

              {/* Keywords */}
              {result.keywords?.length > 0 && (
                <div className="border border-gray-100 rounded-xl p-5">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Keywords for your profile</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw: string) => (
                      <span key={kw} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro tip */}
              {result.tip && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-4">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-800 mb-0.5">Pro tip</p>
                    <p className="text-sm text-amber-700 leading-relaxed">{result.tip}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setResult(null)}
                className="w-full border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Generate a new bio
              </button>

            </div>
          )}

        </div>
      </div>
    </main>
  )
}
