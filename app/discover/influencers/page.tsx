"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Navbar from "@/app/components/Navbar"
import { NICHES, PLATFORMS } from "@/lib/constants"

const colorMap: Record<string, string> = {
  PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
  VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
  MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
}

const LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada", "Gujarati", "Punjabi", "Malayalam"]

function firstName(name: string) {
  return name?.split(" ")[0] || name
}

function parseFollowers(str: string | number | undefined | null): number {
  if (!str) return 0
  const s = str.toString().replace(/,/g, "").trim()
  if (s.endsWith("M") || s.endsWith("m")) return parseFloat(s) * 1000000
  if (s.endsWith("K") || s.endsWith("k")) return parseFloat(s) * 1000
  return parseFloat(s) || 0
}

function parseEngagement(str: string | undefined | null): number {
  if (!str) return 0
  return parseFloat(str.toString().replace("%", "").trim()) || 0
}

function formatFollowers(n: number): string {
  if (n >= 1000000) return `${n % 1000000 === 0 ? n / 1000000 : (n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${n % 1000 === 0 ? n / 1000 : (n / 1000).toFixed(1)}K`
  return n.toString()
}

export default function DiscoverInfluencers() {
  const { data: session, status } = useSession()
  const loggedIn = status !== "loading" && !!session

  const [allInfluencers, setAllInfluencers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [search, setSearch] = useState("")

  // Advanced filter state
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [followerRange, setFollowerRange] = useState<[number, number]>([0, 10000000])
  const [minEngagement, setMinEngagement] = useState(0)
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  useEffect(() => {
    fetchInfluencers()
  }, [])

  async function fetchInfluencers() {
    setLoading(true)
    const res = await fetch("/api/influencers")
    const data = await res.json()
    setAllInfluencers(data.influencers || [])
    console.log("Sample influencer:", data.influencers?.[0])
    setLoading(false)
  }

  function toggleNiche(n: string) {
    setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  }

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  function toggleGender(g: string) {
    setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  function toggleLanguage(l: string) {
    setSelectedLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])
  }

  const advancedFilterCount = [
    followerRange[0] > 0,
    followerRange[1] < 10000000,
    minEngagement > 0,
    selectedGenders.length > 0,
    verifiedOnly,
    locationSearch.length > 0,
    selectedLanguages.length > 0,
  ].filter(Boolean).length

  const hasAnyFilter = !!(search || selectedNiches.length > 0 || selectedPlatforms.length > 0 || advancedFilterCount > 0)

  function resetAllFilters() {
    setSearch("")
    setSelectedNiches([])
    setSelectedPlatforms([])
    setFollowerRange([0, 10000000])
    setMinEngagement(0)
    setSelectedGenders([])
    setVerifiedOnly(false)
    setLocationSearch("")
    setSelectedLanguages([])
  }

  const influencers = allInfluencers.filter(inf => {
    const infNiches = inf.niches?.length ? inf.niches : (inf.niche ? [inf.niche] : [])
    const infPlatforms = inf.platforms?.length ? inf.platforms : (inf.platform ? [inf.platform] : [])
    const matchNiche = selectedNiches.length === 0 || infNiches.some((n: string) => selectedNiches.includes(n))
    const matchPlatform = selectedPlatforms.length === 0 || infPlatforms.some((p: string) => selectedPlatforms.includes(p))
    const matchSearch = !search ||
      inf.name?.toLowerCase().includes(search.toLowerCase()) ||
      infNiches.some((n: string) => n.toLowerCase().includes(search.toLowerCase())) ||
      inf.location?.toLowerCase().includes(search.toLowerCase())

    const f = parseFollowers(inf.followers || inf.instagramFollowers || inf.youtubeFollowers)
    const matchFollowers = f >= followerRange[0] && f <= followerRange[1]

    const e = parseEngagement(inf.engagement)
    const matchEngagement = e >= minEngagement

    const matchGender = selectedGenders.length === 0 || selectedGenders.includes(inf.gender?.toLowerCase())

    const matchVerified = !verifiedOnly || inf.verified === true || inf.instagramVerified === true || inf.youtubeVerified === true

    const matchLocation = !locationSearch || inf.location?.toLowerCase().includes(locationSearch.toLowerCase())

    // TODO: Language field not in schema yet — filter UI ready, filtering disabled until schema updated
    const matchLanguage = true

    return matchNiche && matchPlatform && matchSearch && matchFollowers && matchEngagement && matchGender && matchVerified && matchLocation && matchLanguage
  })

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 py-6 max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC] mb-1">Find Influencers</h1>
        <p className="text-sm text-[#94A3B8] mb-4">Browse AI-scored influencers. Free to search and filter.</p>

        {/* Guest nudge */}
        {!loggedIn && status !== "loading" && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-purple-300">
              🔒 <strong>Sign in free</strong> to see full profiles, stats, and contact details.
            </p>
            <a href="/signup" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center whitespace-nowrap hover:bg-purple-500 transition-colors">
              Create free account
            </a>
          </div>
        )}

        {/* Search */}
        <input
          className="w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#12121A] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 mb-4"
          placeholder="Search by name, niche, or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Advanced Filters toggle row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <span>Advanced Filters {showAdvanced ? "▴" : "▾"}</span>
            {advancedFilterCount > 0 && (
              <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium leading-none">
                {advancedFilterCount}
              </span>
            )}
          </button>
          {hasAnyFilter && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-[#64748B] hover:text-red-400 transition-colors"
            >
              Reset all
            </button>
          )}
        </div>

        {/* Advanced Filters panel */}
        {showAdvanced && (
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Follower Range */}
            <div>
              <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">Followers</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  placeholder="Min e.g. 10000"
                  value={followerRange[0] === 0 ? "" : followerRange[0]}
                  onChange={e => setFollowerRange([parseInt(e.target.value) || 0, followerRange[1]])}
                  className="flex-1 min-w-0 bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50"
                />
                <span className="text-[#64748B] text-xs flex-shrink-0">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max e.g. 1000000"
                  value={followerRange[1] >= 10000000 ? "" : followerRange[1]}
                  onChange={e => setFollowerRange([followerRange[0], parseInt(e.target.value) || 10000000])}
                  className="flex-1 min-w-0 bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50"
                />
              </div>
              {(followerRange[0] > 0 || followerRange[1] < 10000000) && (
                <p className="text-xs text-purple-400 mt-1.5">
                  {formatFollowers(followerRange[0])} – {followerRange[1] >= 10000000 ? "∞" : formatFollowers(followerRange[1])}
                </p>
              )}
            </div>

            {/* Min Engagement Rate */}
            <div>
              <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">Min Engagement Rate</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="e.g. 2.5"
                  value={minEngagement === 0 ? "" : minEngagement}
                  onChange={e => setMinEngagement(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50"
                />
                <span className="text-[#64748B] text-sm font-medium">%</span>
              </div>
            </div>

            {/* Gender */}
            <div>
              <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">Gender</p>
              <div className="flex gap-2 flex-wrap">
                {["Male", "Female", "Other"].map(g => (
                  <button
                    key={g}
                    onClick={() => toggleGender(g.toLowerCase())}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedGenders.includes(g.toLowerCase())
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                        : "bg-[#0D0D1A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Only */}
            <div>
              <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">Verification</p>
              <button
                onClick={() => setVerifiedOnly(v => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  verifiedOnly
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-[#0D0D1A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"
                }`}
              >
                {verifiedOnly && <span>✓</span>} Verified only
              </button>
            </div>

            {/* City / State */}
            <div>
              <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">City / State</p>
              <input
                type="text"
                placeholder="e.g. Mumbai, Delhi"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                className="w-full bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Language (coming soon) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide">Language</p>
                <span className="text-xs bg-[#1E1E2E] text-[#64748B] px-1.5 py-0.5 rounded-full">coming soon</span>
              </div>
              {/* TODO: Language field not in schema yet — filter UI ready, filtering disabled until schema updated */}
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    disabled
                    onClick={() => toggleLanguage(l)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#0D0D1A] border border-[#1E1E2E] text-[#3D3D4E] cursor-not-allowed"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Niche pills (multi-select) */}
        <div className="mb-3">
          <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">
            Niche {selectedNiches.length > 0 && <span className="text-purple-400 normal-case">({selectedNiches.length} selected)</span>}
          </p>
          <div className="flex gap-2 overflow-x-auto flex-nowrap pb-1">
            {NICHES.map(n => (
              <button
                key={n}
                onClick={() => toggleNiche(n)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedNiches.includes(n) ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Platform pills (multi-select) */}
        <div className="mb-5">
          <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-2">
            Platform {selectedPlatforms.length > 0 && <span className="text-purple-400 normal-case">({selectedPlatforms.length} selected)</span>}
          </p>
          <div className="flex gap-2 overflow-x-auto flex-nowrap pb-1">
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedPlatforms.includes(p) ? "bg-[#F8FAFC] text-[#0A0A0F]" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-[#64748B] mb-4">
          {loading ? "Loading..." : (
            influencers.length < allInfluencers.length
              ? <><span className="text-[#94A3B8]">Showing {influencers.length}</span> of {allInfluencers.length} influencers</>
              : `${influencers.length} influencer${influencers.length !== 1 ? "s" : ""}`
          )}
          {selectedNiches.length > 0 && ` · ${selectedNiches.join(", ")}`}
          {selectedPlatforms.length > 0 && ` · ${selectedPlatforms.join(", ")}`}
        </p>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E1E2E] flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-[#1E1E2E] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[#1E1E2E] rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-[#1E1E2E] rounded mb-2"></div>
                <div className="h-8 bg-[#1E1E2E] rounded mt-3"></div>
              </div>
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-[#94A3B8] mb-1">No influencers found</p>
            <p className="text-sm text-[#64748B]">Try a different niche or platform</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {influencers.map((inf: any) => (
              <div
                key={inf.id}
                onClick={() => { window.location.href = `/influencer/${inf.id}` }}
                className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all overflow-hidden"
              >
                {loggedIn ? (
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${colorMap[inf.initials] || "bg-purple-500"} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                        {inf.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-[#F8FAFC] text-sm truncate">{inf.name}</span>
                          {inf.verified && <span className="bg-cyan-500/10 text-cyan-400 text-xs px-1.5 py-0.5 rounded-full font-semibold border border-cyan-500/20 flex-shrink-0">✓ Verified</span>}
                        </div>
                        <p className="text-xs text-[#64748B] truncate">
                          <span className="blur-sm select-none">••••••••</span> · {inf.location}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-semibold text-purple-400">{inf.score}</p>
                        <p className="text-xs text-[#64748B]">AI Score</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                      {(inf.niches?.length ? inf.niches : (inf.niche ? [inf.niche] : [])).map((n: string) => (
                        <span key={n} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                      {(inf.platforms?.length ? inf.platforms : (inf.platform ? [inf.platform] : [])).map((p: string) => (
                        <span key={p} className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                      {inf.instagramVerified && (
                        <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">Instagram <span className="text-green-400">✓</span></span>
                      )}
                      {inf.youtubeVerified && (
                        <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">YouTube <span className="text-green-400">✓</span></span>
                      )}
                      {!inf.instagramVerified && !inf.youtubeVerified && (
                        <span className="text-xs bg-[#1E1E2E] text-[#64748B] px-2 py-0.5 rounded-full">Unverified</span>
                      )}
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 bg-[#0D0D1A] rounded-lg p-2 text-center">
                        {inf.followersPublic ? (
                          <p className="text-xs font-medium text-[#F8FAFC]">{inf.followers}</p>
                        ) : (
                          <p className="text-xs text-[#64748B]">🔒 Private</p>
                        )}
                        <p className="text-xs text-[#64748B]">Followers</p>
                      </div>
                      <div className="flex-1 bg-[#0D0D1A] rounded-lg p-2 text-center">
                        <p className="text-xs font-medium text-[#F8FAFC]">{inf.engagement}</p>
                        <p className="text-xs text-[#64748B]">Engagement</p>
                      </div>
                      <div className="flex-1 bg-[#0D0D1A] rounded-lg p-2 text-center">
                        <p className="text-xs font-medium text-[#F8FAFC]">{inf.rate}</p>
                        <p className="text-xs text-[#64748B]">Avg. rate</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a
                        href={`/influencer/${inf.id}`}
                        onClick={e => e.stopPropagation()}
                        className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-500 transition-colors"
                      >
                        Send Proposal →
                      </a>
                      <a
                        href={`/influencer/${inf.id}`}
                        onClick={e => e.stopPropagation()}
                        className="block w-full text-center border border-[#1E1E2E] text-[#94A3B8] py-2 rounded-lg text-xs hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors"
                      >
                        View profile
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full ${colorMap[inf.initials] || "bg-purple-500"} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                        {inf.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="font-medium text-[#F8FAFC] text-sm">{firstName(inf.name)}</span>
                          {inf.verified && <span className="bg-cyan-500/10 text-cyan-400 text-xs px-1.5 py-0.5 rounded-full font-semibold border border-cyan-500/20">✓ Verified</span>}
                        </div>
                        <p className="text-xs text-[#64748B]">{inf.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                      {(inf.niches?.length ? inf.niches : (inf.niche ? [inf.niche] : [])).map((n: string) => (
                        <span key={n} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                      {(inf.platforms?.length ? inf.platforms : (inf.platform ? [inf.platform] : [])).map((p: string) => (
                        <span key={p} className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                      {inf.instagramVerified && (
                        <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">Instagram <span className="text-green-400">✓</span></span>
                      )}
                      {inf.youtubeVerified && (
                        <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">YouTube <span className="text-green-400">✓</span></span>
                      )}
                      {!inf.instagramVerified && !inf.youtubeVerified && (
                        <span className="text-xs bg-[#1E1E2E] text-[#64748B] px-2 py-0.5 rounded-full">Unverified</span>
                      )}
                    </div>
                    <div className="bg-[#0D0D1A] rounded-lg px-3 py-2 mb-3 text-xs text-[#64748B]">
                      🔒 Sign in to see stats and contact details
                    </div>
                    <a
                      href={`/influencer/${inf.id}`}
                      onClick={e => e.stopPropagation()}
                      className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-500 transition-colors"
                    >
                      View profile
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
