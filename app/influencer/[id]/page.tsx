"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"

function firstName(name: string) {
  return name?.split(" ")[0] || name
}

function LockedInline() {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-400">
      🔒{" "}
      <a href="/login" className="text-purple-600 hover:underline text-sm">Sign in to view</a>
    </span>
  )
}

function SignupPromptCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="font-semibold text-gray-900 mb-2">Create a free account to continue</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
        Sign up free to see this influencer's full profile, contact details, AI score breakdown, and more.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/signup" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          Create free account
        </a>
        <a href="/login" className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          Sign in
        </a>
      </div>
      <p className="text-xs text-gray-400 mt-4">5 free credits on signup · No card needed</p>
    </div>
  )
}

export default function InfluencerProfile() {
  const { data: session, status } = useSession()
  const loggedIn = status !== "loading" && !!session
  const params = useParams()
  const router = useRouter()
  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState("")
  const [credits, setCredits] = useState(0)
  const [aiScores, setAiScores] = useState(null)
  const [scoring, setScoring] = useState(false)

  const colorMap = {
    PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
    VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
    MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
  }

  useEffect(() => {
    fetchInfluencer()
    if (session?.user?.id) {
      fetch(`/api/user-credits?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => setCredits(data.credits))
    }
  }, [params.id, session])

  async function fetchInfluencer() {
    const res = await fetch(`/api/influencers/${params.id}`)
    const data = await res.json()
    setInfluencer(data.influencer)
    setUnlocked(data.unlocked)
    setLoading(false)
  }

  async function handleUnlock() {
    if (!session) { router.push("/login"); return }
    setUnlocking(true)
    setError("")
    const res = await fetch("/api/unlock-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: params.id, userId: session.user.id }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setUnlocking(false); return }
    setUnlocked(true)
    setCredits(data.newCredits)
    setInfluencer((prev) => ({ ...prev, email: data.email, phone: data.phone }))
    setUnlocking(false)
  }

  async function generateScore() {
    if (!session) { router.push("/login"); return }
    setScoring(true)
    if (credits < 3) { alert("You need 3 credits to generate an AI score."); setScoring(false); return }
    const res = await fetch("/api/ai-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: params.id }),
    })
    const data = await res.json()
    if (data.success) { setAiScores(data.scores); setCredits((prev) => prev - 3) }
    else { alert("Failed to generate score. Please try again.") }
    setScoring(false)
  }

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  if (!influencer) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Influencer not found</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">← Back</a>
          {loggedIn ? (
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-purple-600 font-medium">{credits} credits</span>
            </div>
          ) : (
            <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Sign in</a>
          )}
        </div>
      </nav>

      <div className="px-4 md:px-8 py-8 md:py-10 max-w-4xl mx-auto">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${colorMap[influencer.initials] || "bg-purple-500"} flex items-center justify-center text-white font-semibold text-xl md:text-2xl flex-shrink-0`}>
              {influencer.initials}
            </div>
            <div className="flex-1 min-w-0">
              {/* Name row */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {loggedIn ? (
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{influencer.name}</h1>
                ) : (
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{firstName(influencer.name)}</h1>
                )}
                {influencer.verified && (
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                )}
              </div>

              {/* Handle + location row */}
              <div className="text-gray-400 text-sm mb-3">
                {loggedIn ? (
                  <>{influencer.handle} · {influencer.location}</>
                ) : (
                  <>{influencer.location} · <LockedInline /></>
                )}
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{influencer.niche}</span>
                <span className="text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">{influencer.platform}</span>
              </div>
              {/* Bio always visible */}
              <p className="text-gray-500 text-sm leading-relaxed">{influencer.about}</p>
            </div>

            {/* AI Score: locked for guests */}
            <div className="text-center flex-shrink-0 sm:ml-auto">
              {loggedIn ? (
                <>
                  <div className="text-3xl md:text-4xl font-semibold text-purple-600">{influencer.score}</div>
                  <div className="text-xs text-gray-400 mt-1">AI Score</div>
                </>
              ) : (
                <>
                  <div className="text-3xl md:text-4xl text-gray-300">🔒</div>
                  <div className="text-xs text-gray-400 mt-1">AI Score</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats: locked for guests */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {loggedIn ? (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 text-center">
                <div className="text-xl md:text-2xl font-semibold text-gray-900">{influencer.followers}</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Followers</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 text-center">
                <div className="text-xl md:text-2xl font-semibold text-gray-900">{influencer.engagement}</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Engagement</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 text-center">
                <div className="text-xl md:text-2xl font-semibold text-gray-900">{influencer.rate}</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Avg. rate</div>
              </div>
            </>
          ) : (
            <>
              {["Followers", "Engagement", "Avg. rate"].map((label) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 text-center">
                  <div className="text-2xl text-gray-300 mb-1">🔒</div>
                  <div className="text-xs md:text-sm text-gray-400">{label}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* AI Score Breakdown OR signup prompt */}
        {loggedIn ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">AI Score Breakdown</h2>
                <p className="text-xs text-gray-400 mt-1">Powered by InfluenceIQ AI · Updated on demand</p>
              </div>
              <button
                onClick={generateScore}
                disabled={scoring}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {scoring ? "Analyzing..." : "Generate AI Score — 3 cr"}
              </button>
            </div>

            {aiScores ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Engagement Rate", value: aiScores.engagement, note: aiScores.engagementNote },
                    { label: "Audience Quality", value: aiScores.audienceQuality, note: aiScores.audienceQualityNote },
                    { label: "Content Consistency", value: aiScores.contentConsistency, note: aiScores.contentConsistencyNote },
                    { label: "Niche Authority", value: aiScores.nicheAuthority, note: aiScores.nicheAuthorityNote },
                    { label: "Growth Trend", value: aiScores.growthTrend, note: aiScores.growthTrendNote },
                    { label: "Brand Safety", value: aiScores.brandSafety, note: aiScores.brandSafetyNote },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-sm font-semibold text-purple-600">{item.value}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${item.value}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400">{item.note}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-purple-600">{aiScores.overallScore}</span>
                    <span className="text-sm text-gray-500">Overall AI Score</span>
                  </div>
                  <p className="text-sm text-gray-600">{aiScores.summary}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-3">⚡</div>
                <div className="font-medium text-gray-600 mb-1">No AI score generated yet</div>
                <div className="text-sm">Click Generate AI Score to get a detailed breakdown — costs 3 credits</div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <SignupPromptCard />
          </div>
        )}

        {/* Contact section: logged in only */}
        {loggedIn && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8">
            <h2 className="font-semibold text-gray-900 mb-2">Contact details</h2>

            {unlocked ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <span className="text-lg">✉️</span>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Email</div>
                    <div className="font-medium text-gray-900">{influencer.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <span className="text-lg">📱</span>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Phone</div>
                    <div className="font-medium text-gray-900">{influencer.phone}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Contact details unlocked. Please use this information responsibly.
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Unlock this influencer's email and phone number to contact them directly.
                </p>
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Email address</div>
                    <div className="text-sm text-gray-400">••••••••••@••••••.com</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Phone number</div>
                    <div className="text-sm text-gray-400">+91 ••••• •••••</div>
                  </div>
                </div>
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {unlocking ? "Unlocking..." : "Unlock contact details — 5 credits"}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
