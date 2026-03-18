"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState("brand")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [youtubeHandle, setYoutubeHandle] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("role") === "influencer") {
      setRole("influencer")
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, instagramHandle: instagramHandle || undefined, youtubeHandle: youtubeHandle || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      if (role === "influencer") {
        router.push("/login?success=Account created! Please sign in.&next=/join")
      } else {
        router.push("/login?success=Account created! Please sign in.")
      }

    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-8 w-full max-w-md shadow-2xl shadow-black/50">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-semibold text-[#F8FAFC]">
              Influence<span className="text-purple-400">IQ</span>
            </span>
          </a>
          <p className="text-[#94A3B8] text-sm mt-2">Create your free account</p>
        </div>

        {/* Account type selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("brand")}
            className={`border-2 rounded-xl p-3 text-center transition-colors ${role === "brand" ? "border-purple-500 bg-purple-500/10" : "border-[#1E1E2E] hover:border-purple-500/50 bg-[#0A0A0F]"}`}
          >
            <div className="text-xl mb-1">🏢</div>
            <div className={`text-sm font-medium ${role === "brand" ? "text-purple-300" : "text-[#94A3B8]"}`}>I am a Brand</div>
            <div className={`text-xs mt-0.5 ${role === "brand" ? "text-purple-400/70" : "text-[#64748B]"}`}>Find influencers</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("influencer")}
            className={`border-2 rounded-xl p-3 text-center transition-colors ${role === "influencer" ? "border-purple-500 bg-purple-500/10" : "border-[#1E1E2E] hover:border-purple-500/50 bg-[#0A0A0F]"}`}
          >
            <div className="text-xl mb-1">⭐</div>
            <div className={`text-sm font-medium ${role === "influencer" ? "text-purple-300" : "text-[#94A3B8]"}`}>I am an Influencer</div>
            <div className={`text-xs mt-0.5 ${role === "influencer" ? "text-purple-400/70" : "text-[#64748B]"}`}>Get discovered</div>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg mb-4 border border-red-500/20">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
              placeholder="Min. 8 characters"
              required
            />
          </div>
          {role === "influencer" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Instagram Handle <span className="text-[#64748B] font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
                  placeholder="@instagram_username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">YouTube Channel <span className="text-[#64748B] font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={youtubeHandle}
                  onChange={(e) => setYoutubeHandle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
                  placeholder="@youtube_channel"
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-500/20"
          >
            {loading ? "Creating account..." : "Create account — free"}
          </button>
        </form>

        <p className="text-center text-xs text-[#64748B] mt-4">
          You get 5 free credits on sign up. No credit card needed.
        </p>

        <p className="text-center text-sm text-[#94A3B8] mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 hover:underline font-medium">Sign in</a>
        </p>

      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
      <SignupForm />
    </Suspense>
  )
}
