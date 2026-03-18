"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Navbar from "@/app/components/Navbar"

function LoginForm() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12">
      <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-8 w-full max-w-md shadow-2xl shadow-black/50">

        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-semibold text-[#F8FAFC]">
              Influence<span className="text-purple-400">IQ</span>
            </span>
          </a>
          <p className="text-[#94A3B8] text-sm mt-2">Sign in to your account</p>
        </div>

        {success && (
          <div className="bg-[#10B981]/10 text-[#10B981] text-sm px-4 py-3 rounded-lg mb-4 border border-[#10B981]/20">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg mb-4 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-[#94A3B8] mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-purple-400 hover:underline font-medium">Sign up free</a>
        </p>

      </div>
      </div>
    </main>
  )
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
