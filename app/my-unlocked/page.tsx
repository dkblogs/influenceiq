"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

function daysRemaining(expiresAt: string) {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
}

function expiryColor(days: number) {
  if (days > 7) return { badge: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20", dot: "bg-[#10B981]" }
  if (days >= 3) return { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" }
  return { badge: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" }
}

export default function MyUnlockedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [unlocked, setUnlocked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    const role = (session?.user as any)?.role
    if (role !== "brand") { router.push("/dashboard"); return }

    fetch("/api/my-unlocked")
      .then(r => r.json())
      .then(d => setUnlocked(d.unlocked || []))
      .finally(() => setLoading(false))
  }, [status, router, session])

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Unlocked Influencers</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Influencers you've unlocked contact details for · 30-day access per unlock</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1E1E2E]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#1E1E2E] rounded w-1/3" />
                    <div className="h-3 bg-[#1E1E2E] rounded w-1/2" />
                    <div className="h-3 bg-[#1E1E2E] rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : unlocked.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔒</div>
            <div className="text-[#F8FAFC] font-medium mb-2">No unlocked influencers yet</div>
            <div className="text-sm text-[#64748B] mb-6">Unlock an influencer's contact details to reach out directly.</div>
            <a href="/discover/influencers" className="inline-block bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors">
              Browse Influencers →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {unlocked.map((item: any) => {
              const inf = item.influencer
              const days = daysRemaining(item.expiresAt)
              const colors = expiryColor(days)
              const expDate = new Date(item.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

              return (
                <div key={item.id} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 hover:border-purple-500/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-lg flex-shrink-0">
                      {inf.initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-[#F8FAFC]">{inf.name}</span>
                        {inf.verified && (
                          <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${colors.dot}`} />
                          {days} day{days !== 1 ? "s" : ""} left · expires {expDate}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        <span className="bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded">{inf.niche}</span>
                        <span className="bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded">{inf.platform}</span>
                        <span className="bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded">{inf.location}</span>
                      </div>

                      {/* Contact details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-2 bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg px-3 py-2">
                          <span className="text-sm">✉️</span>
                          <div className="min-w-0">
                            <div className="text-xs text-[#64748B]">Email</div>
                            <div className="text-sm text-[#F8FAFC] truncate">{inf.email || "Not provided"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg px-3 py-2">
                          <span className="text-sm">📱</span>
                          <div>
                            <div className="text-xs text-[#64748B]">Phone</div>
                            <div className="text-sm text-[#F8FAFC]">{inf.phone || "Not provided"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <a
                      href={`/influencer/${inf.id}`}
                      className="flex-shrink-0 text-sm text-purple-400 hover:text-purple-300 border border-purple-500/20 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Profile →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
