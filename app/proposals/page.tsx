"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

const STATUS_STYLE: Record<string, string> = {
  pending:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
  negotiating: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  agreed:      "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  rejected:    "bg-red-500/10 text-red-400 border-red-500/20",
  withdrawn:   "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]",
}
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", negotiating: "Negotiating", agreed: "✅ Agreed",
  rejected: "Rejected", withdrawn: "Withdrawn",
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

export default function ProposalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    fetch("/api/proposals")
      .then(r => r.json())
      .then(d => setProposals(d.proposals || []))
      .finally(() => setLoading(false))
  }, [status, router])

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Proposals</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {role === "brand" ? "Collaboration proposals you've sent to influencers" : "Collaboration proposals received from brands"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-purple-400 text-sm gap-3">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📋</div>
            <div className="text-[#F8FAFC] font-medium mb-2">No proposals yet</div>
            <div className="text-sm text-[#64748B]">
              {role === "brand"
                ? "Browse influencer profiles to send collaboration proposals."
                : "Brands will send you collaboration proposals here."}
            </div>
            {role === "brand" && (
              <a href="/discover/influencers" className="inline-block mt-6 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors">
                Browse Influencers →
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map(p => (
              <a
                key={p.id}
                href={`/proposals/${p.id}`}
                className="block bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-[#F8FAFC] truncate">{p.campaignTitle}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[p.status] ?? STATUS_STYLE.pending}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                      {p.latestRound?.roundNumber > 1 && (
                        <span className="text-xs text-[#64748B]">Round {p.latestRound.roundNumber}</span>
                      )}
                    </div>
                    <div className="text-sm text-[#64748B] mb-2">
                      {role === "brand" ? `To: ${p.influencerName}` : `From: ${p.brandName}`}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded">{p.contentType}</span>
                      <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">{p.remuneration}</span>
                      <span className="bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded">{p.timeline}</span>
                    </div>
                  </div>
                  <div className="text-xs text-[#64748B] flex-shrink-0">{timeAgo(p.updatedAt)}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
