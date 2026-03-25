"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

type Workspace = {
  id: string
  campaignTitle: string
  status: string
  paymentStatus: string
  paymentAmount?: string
  brandId: string
  influencerId: string
  createdAt: string
  updatedAt: string
  milestones: Array<{ id: string; title: string; status: string; order: number }>
  _count: { deliverables: number; reviews: number }
}

const PAYMENT_STYLE: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
}

function daysSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export default function WorkspacesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    fetch("/api/my-workspaces")
      .then(r => r.json())
      .then(data => { setWorkspaces(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [status])

  return (
    <div className="min-h-screen bg-[#0A0A12]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">My Workspaces</h1>
          <p className="text-sm text-[#64748B] mt-1">Active campaign collaborations</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 animate-pulse">
                <div className="h-4 bg-[#1E1E2E] rounded w-1/2 mb-3" />
                <div className="h-2 bg-[#1E1E2E] rounded w-full mb-2" />
                <div className="h-2 bg-[#1E1E2E] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-lg font-semibold text-[#F8FAFC] mb-2">No active workspaces yet</h2>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto mb-6">
              Agree on a proposal to start collaborating. Your workspace will be created automatically.
            </p>
            <a
              href="/proposals"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              View Proposals →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {workspaces.map(ws => {
              const completed = ws.milestones.filter(m => m.status === "completed").length
              const total = ws.milestones.length
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0
              const nextMilestone = ws.milestones.find(m => m.status !== "completed")

              return (
                <a
                  key={ws.id}
                  href={`/workspace/${ws.id}`}
                  className="block bg-[#12121A] rounded-2xl border border-[#1E1E2E] hover:border-purple-500/30 p-5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-[#F8FAFC] truncate group-hover:text-purple-300 transition-colors">
                        {ws.campaignTitle}
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">Started {daysSince(ws.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${PAYMENT_STYLE[ws.paymentStatus] || PAYMENT_STYLE.pending}`}>
                        {ws.paymentStatus === "pending" ? "Payment pending"
                          : ws.paymentStatus === "sent" ? "Payment sent"
                          : "Payment confirmed"}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
                      <span>Progress</span>
                      <span>{completed}/{total} milestones</span>
                    </div>
                    <div className="h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Next milestone + stats */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs text-[#64748B]">
                      {nextMilestone ? (
                        <>Next: <span className="text-[#94A3B8]">{nextMilestone.title}</span></>
                      ) : (
                        <span className="text-[#10B981]">✓ All milestones done</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#64748B]">
                      {ws._count.deliverables > 0 && <span>📦 {ws._count.deliverables}</span>}
                      {ws._count.reviews > 0 && <span>⭐ {ws._count.reviews}</span>}
                      {ws.paymentAmount && <span className="text-purple-400 font-medium">{ws.paymentAmount}</span>}
                      <span className="text-purple-400 group-hover:text-purple-300 transition-colors">Open →</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
