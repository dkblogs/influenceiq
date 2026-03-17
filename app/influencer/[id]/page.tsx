"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"

export default function InfluencerProfile() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState("")
  const [credits, setCredits] = useState(0)

  const colorMap = {
    PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
    VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
    MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
  }

  useEffect(() => {
    fetchInfluencer()
    if (session?.user?.credits) setCredits(session.user.credits)
  }, [params.id, session])

  async function fetchInfluencer() {
    const res = await fetch(`/api/influencers/${params.id}`)
    const data = await res.json()
    setInfluencer(data.influencer)
    setUnlocked(data.unlocked)
    setLoading(false)
  }

  async function handleUnlock() {
    if (!session) {
      router.push("/login")
      return
    }
    setUnlocking(true)
    setError("")

    const res = await fetch("/api/unlock-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        influencerId: params.id,
        userId: session.user.id,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setUnlocking(false)
      return
    }

    setUnlocked(true)
    setCredits(data.newCredits)
    setInfluencer((prev) => ({ ...prev, email: data.email, phone: data.phone }))
    setUnlocking(false)
    await fetch("/api/auth/session?update")
    window.location.reload()
  }

  if (loading) {
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

      {/* Navigation */}
      <nav className="bg-white flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">← Back to discover</a>
          {session && (
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-purple-600 font-medium">{credits} credits</span>
            </div>
          )}
        </div>
      </nav>

      <div className="px-8 py-10 max-w-4xl mx-auto">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-2xl ${colorMap[influencer.initials] || "bg-purple-500"} flex items-center justify-center text-white font-semibold text-2xl flex-shrink-0`}>
              {influencer.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold text-gray-900">{influencer.name}</h1>
                {influencer.verified && (
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                )}
              </div>
              <div className="text-gray-400 mb-3">{influencer.handle} · {influencer.location}</div>
              <div className="flex gap-2 mb-4">
                <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{influencer.niche}</span>
                <span className="text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">{influencer.platform}</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{influencer.about}</p>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="text-4xl font-semibold text-purple-600">{influencer.score}</div>
              <div className="text-xs text-gray-400 mt-1">AI Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="text-2xl font-semibold text-gray-900">{influencer.followers}</div>
            <div className="text-sm text-gray-400 mt-1">Followers</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="text-2xl font-semibold text-gray-900">{influencer.engagement}</div>
            <div className="text-sm text-gray-400 mt-1">Engagement rate</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="text-2xl font-semibold text-gray-900">{influencer.rate}</div>
            <div className="text-sm text-gray-400 mt-1">Avg. rate per post</div>
          </div>
        </div>

        {/* Contact section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
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
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
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
                {unlocking ? "Unlocking..." : session ? "Unlock contact details — 5 credits" : "Sign in to unlock"}
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}