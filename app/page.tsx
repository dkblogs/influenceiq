"use client"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  if (status === "loading" || status === "authenticated") {
    return <div className="min-h-screen bg-[#0A0A0F]" />
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="text-3xl">⚡</span>
          <span className="text-2xl font-bold text-[#F8FAFC]">
            Influence<span className="text-purple-400">IQ</span>
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#F8FAFC]">Who are you?</h1>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <a
          href="/for-brands"
          className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
        >
          <span className="text-5xl">🏢</span>
          <span className="text-[#F8FAFC] font-semibold text-sm">I&apos;m a Brand</span>
          <p className="text-sm text-white/50 mt-1 text-center">Discover and collaborate with top creators</p>
          <span className="text-purple-400 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
        </a>

        <a
          href="/for-influencers"
          className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
        >
          <span className="text-5xl">⭐</span>
          <span className="text-[#F8FAFC] font-semibold text-sm">I&apos;m a Creator</span>
          <p className="text-sm text-white/50 mt-1 text-center">Get brand deals and grow your audience</p>
          <span className="text-cyan-400 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
        </a>
      </div>

      <p className="mt-8 text-sm text-[#64748B]">
        Already have an account?{" "}
        <a href="/login" className="text-purple-400 hover:underline font-medium">Log in →</a>
      </p>
    </main>
  )
}
