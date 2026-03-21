"use client"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { data: session, status } = useSession()
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
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="mb-10 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-3xl">⚡</span>
          <span className="text-2xl font-bold text-[#F8FAFC]">
            Influence<span className="text-purple-400">IQ</span>
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-3">Welcome to InfluenceIQ</h1>
        <p className="text-[#94A3B8] text-base md:text-lg max-w-md mx-auto">
          India&apos;s AI-powered influencer marketplace — zero commission, verified creators
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl relative z-10">

        {/* Brand card */}
        <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-7 flex flex-col hover:border-purple-500/40 transition-colors group">
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">I&apos;m a Brand</h2>
          <p className="text-[#94A3B8] text-sm mb-5">
            Find perfect influencers, run campaigns, grow your business
          </p>
          <ul className="space-y-2 mb-7 flex-1">
            {["Discover verified influencers", "AI-powered matching", "Zero commission"].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-[#64748B]">
                <span className="text-[#10B981] font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <a
            href="/for-brands"
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-colors text-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30"
          >
            Continue as Brand →
          </a>
        </div>

        {/* Influencer card */}
        <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-7 flex flex-col hover:border-cyan-500/40 transition-colors group">
          <div className="text-4xl mb-4">⭐</div>
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">I&apos;m a Creator</h2>
          <p className="text-[#94A3B8] text-sm mb-5">
            Get discovered by top brands, collaborate, earn more
          </p>
          <ul className="space-y-2 mb-7 flex-1">
            {["Get brand deals", "AI Score & verified badge", "Zero commission"].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-[#64748B]">
                <span className="text-[#10B981] font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <a
            href="/for-influencers"
            className="w-full bg-[#12121A] border border-cyan-500/40 text-cyan-400 py-3 rounded-xl text-sm font-semibold hover:bg-cyan-500/10 transition-colors text-center group-hover:border-cyan-500/70"
          >
            Continue as Creator →
          </a>
        </div>
      </div>

      {/* Bottom login link */}
      <p className="mt-8 text-sm text-[#64748B] relative z-10">
        Already have an account?{" "}
        <a href="/login" className="text-purple-400 hover:underline font-medium">Log in →</a>
      </p>
    </main>
  )
}
