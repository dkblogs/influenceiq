"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Signup() {
  const router = useRouter()
  const [role, setRole] = useState("brand")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      router.push("/login?success=Account created! Please sign in.")

    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-semibold">
              Influence<span className="text-purple-600">IQ</span>
            </span>
          </a>
          <p className="text-gray-500 text-sm mt-2">Create your free account</p>
        </div>

        {/* Account type selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("brand")}
            className={`border-2 rounded-xl p-3 text-center transition-colors ${role === "brand" ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}
          >
            <div className="text-xl mb-1">🏢</div>
            <div className={`text-sm font-medium ${role === "brand" ? "text-purple-700" : "text-gray-700"}`}>I am a Brand</div>
            <div className={`text-xs mt-0.5 ${role === "brand" ? "text-purple-500" : "text-gray-400"}`}>Find influencers</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("influencer")}
            className={`border-2 rounded-xl p-3 text-center transition-colors ${role === "influencer" ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}
          >
            <div className="text-xl mb-1">⭐</div>
            <div className={`text-sm font-medium ${role === "influencer" ? "text-purple-700" : "text-gray-700"}`}>I am an Influencer</div>
            <div className={`text-xs mt-0.5 ${role === "influencer" ? "text-purple-500" : "text-gray-400"}`}>Get discovered</div>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min. 8 characters"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create account — free"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          You get 5 free credits on sign up. No credit card needed.
        </p>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 hover:underline font-medium">Sign in</a>
        </p>

      </div>
    </main>
  )
}