"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

export default function AgreedCollaborationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    const role = (session?.user as any)?.role
    if (role !== "brand") { router.push("/dashboard"); return }

    fetch("/api/proposals?status=agreed")
      .then(r => r.json())
      .then(d => setProposals(d.proposals || []))
      .finally(() => setLoading(false))
  }, [status, router, session])

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Agreed Collaborations</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Proposals you&apos;ve agreed on — contact details are visible on each influencer&apos;s profile</p>
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
        ) : proposals.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🤝</div>
            <div className="text-[#F8FAFC] font-medium mb-2">No agreed collaborations yet</div>
            <div className="text-sm text-[#64748B] mb-6">Send proposals to influencers. Once both parties agree, contact details become visible.</div>
            <a href="/discover/influencers" className="inline-block bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors">
              Find Influencers →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((p: any) => {
              const inf = p.influencer
              const agreedDate = new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
              return (
                <div key={p.id} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 hover:border-purple-500/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-lg flex-shrink-0">
                      {inf?.initials || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-[#F8FAFC]">{inf?.name || "Influencer"}</span>
                        {inf?.verified && (
                          <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                        )}
                        <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full">🤝 Agreed</span>
                      </div>
                      <div className="text-xs text-[#64748B] mb-2">
                        <span className="font-medium text-[#94A3B8]">{p.campaignTitle}</span> · Agreed on {agreedDate}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        {(inf?.niches?.length ? inf.niches : (inf?.niche ? [inf.niche] : [])).map((n: string) => (
                          <span key={n} className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">{n}</span>
                        ))}
                        {(inf?.platforms?.length ? inf.platforms : (inf?.platform ? [inf.platform] : [])).map((pl: string) => (
                          <span key={pl} className="bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded">{pl}</span>
                        ))}
                        {inf?.location && <span className="bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded">{inf.location}</span>}
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Contact details are visible on their profile page.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <a
                        href={`/influencer/${inf?.id}`}
                        className="text-sm text-purple-400 hover:text-purple-300 border border-purple-500/20 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-center"
                      >
                        View Profile →
                      </a>
                      <a
                        href={`/proposals/${p.id}`}
                        className="text-sm text-[#64748B] hover:text-[#94A3B8] border border-[#1E1E2E] px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-center"
                      >
                        View Proposal →
                      </a>
                    </div>
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
