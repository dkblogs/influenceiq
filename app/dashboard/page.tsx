"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [credits, setCredits] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user-credits?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => setCredits(data.credits))
    }
  }, [session])

  if (status === "loading" || credits === null) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  if (!session) return null

  const user = session.user
  const initial = user.name ? user.name[0].toUpperCase() : "U"

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navigation */}
      <nav className="bg-white flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">
            Influence<span className="text-purple-600">IQ</span>
          </span>
        </a>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">Find Influencers</a>
          <a href="/brands" className="text-sm text-gray-500 hover:text-gray-900">Find Brands</a>
          <a href="/campaigns" className="text-sm text-gray-500 hover:text-gray-900">Campaigns</a>
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-purple-600 font-medium">{credits} credits</span>
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {initial}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Sign out
          </button>
        </div>
        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-3">
          <div className="bg-purple-50 px-2 py-1 rounded-lg">
            <span className="text-xs text-purple-600 font-medium">{credits} cr</span>
          </div>
          <button
            className="flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-gray-600"></span>
            <span className="block w-5 h-0.5 bg-gray-600"></span>
            <span className="block w-5 h-0.5 bg-gray-600"></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <a href="/discover" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Influencers</a>
          <a href="/brands" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Brands</a>
          <a href="/campaigns" className="text-sm text-gray-600 py-2 border-b border-gray-50">Campaigns</a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-red-500 py-2 text-left"
          >
            Sign out
          </button>
        </div>
      )}

      <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">

        {/* Welcome */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            You are signed in as {user.role === "brand" ? "a Brand" : "an Influencer"} · {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Credits remaining</div>
            <div className="text-2xl font-semibold text-purple-600">{credits}</div>
            <div className="text-xs text-gray-400 mt-1">Never expire</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Influencers unlocked</div>
            <div className="text-2xl font-semibold text-gray-900">0</div>
            <div className="text-xs text-gray-400 mt-1">Unlock for 5 credits</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Proposals sent</div>
            <div className="text-2xl font-semibold text-gray-900">0</div>
            <div className="text-xs text-gray-400 mt-1">Send for 10 credits</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">AI reports</div>
            <div className="text-2xl font-semibold text-gray-900">0</div>
            <div className="text-xs text-gray-400 mt-1">Get one for 3 credits</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Get started */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Get started</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🔍</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {user.role === "brand" ? "Browse influencers" : "Browse brands"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.role === "brand" ? "Search by niche, platform, location — free" : "Find brands looking for your niche — free"}
                  </div>
                </div>
                <a href={user.role === "brand" ? "/discover" : "/brands"} className="text-xs text-purple-600 font-medium whitespace-nowrap">Browse →</a>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📋</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Open campaigns</div>
                  <div className="text-xs text-gray-400">
                    {user.role === "brand" ? "Post a campaign — 15 credits" : "Apply to campaigns — 2 credits each"}
                  </div>
                </div>
                <a href="/campaigns" className="text-xs text-purple-600 font-medium whitespace-nowrap">View →</a>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">💳</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Buy more credits</div>
                  <div className="text-xs text-gray-400">Starter ₹499 · Growth ₹1,499 · Agency ₹3,999</div>
                </div>
                <a href="/pricing" className="text-xs text-purple-600 font-medium whitespace-nowrap">Buy →</a>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Your credits</h2>
            <div className="text-center py-4">
              <div className="text-5xl font-semibold text-purple-600 mb-1">{credits}</div>
              <div className="text-sm text-gray-400 mb-6">credits remaining</div>
              <a href="/pricing" className="block w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 text-center">
                Buy credits
              </a>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="text-xs font-medium text-gray-500 mb-3">What you can do</div>
              <div className="space-y-2">
                {user.role === "brand" ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Unlock contacts</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 5)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">AI reports</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 3)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Proposals</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 10)}x</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Campaign applications</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 2)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Send requests</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 10)}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Profile views</span>
                      <span className="text-gray-900 font-medium">{Math.floor(credits / 5)}x</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
