"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

const colorMap: Record<string, string> = {
  PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
  VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
  MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "⏳ Pending",
  accepted: "✅ Accepted",
  rejected: "❌ Not Selected",
}

export default function MyCampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [applicantsMap, setApplicantsMap] = useState<Record<string, any[]>>({})
  const [applicantsLoading, setApplicantsLoading] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    if (user?.role !== "brand") { router.push("/dashboard"); return }

    fetch(`/api/campaigns?brandId=${user.id}`)
      .then(r => r.json())
      .then(d => setCampaigns(d.campaigns || []))
      .finally(() => setLoading(false))
  }, [status, user?.id, user?.role, router])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  async function toggleExpand(campaignId: string) {
    if (expandedId === campaignId) {
      setExpandedId(null)
      return
    }
    setExpandedId(campaignId)
    if (applicantsMap[campaignId]) return

    setApplicantsLoading(prev => ({ ...prev, [campaignId]: true }))
    try {
      const res = await fetch(`/api/campaign-applications?campaignId=${campaignId}`)
      const data = await res.json()
      setApplicantsMap(prev => ({ ...prev, [campaignId]: data.applications || [] }))
    } finally {
      setApplicantsLoading(prev => ({ ...prev, [campaignId]: false }))
    }
  }

  async function handleAction(applicationId: string, campaignId: string, newStatus: "accepted" | "rejected") {
    setActionLoading(applicationId)
    try {
      const res = await fetch(`/api/campaign-applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) { showToast("Failed to update"); return }

      setApplicantsMap(prev => ({
        ...prev,
        [campaignId]: (prev[campaignId] || []).map(a =>
          a.id === applicationId ? { ...a, status: newStatus } : a
        ),
      }))
      showToast(newStatus === "accepted" ? "✅ Application accepted!" : "Application rejected.")
    } finally {
      setActionLoading(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-purple-400 text-sm gap-3">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading campaigns...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#12121A] border border-[#1E1E2E] text-[#F8FAFC] text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC]">My Campaigns</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Manage your posted campaigns and review applicants</p>
          </div>
          <a
            href="/post-campaign"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
          >
            + Post Campaign
          </a>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📋</div>
            <div className="text-[#F8FAFC] font-medium mb-2">No campaigns posted yet</div>
            <div className="text-sm text-[#64748B] mb-6">Post your first campaign to start receiving influencer applications.</div>
            <a href="/post-campaign" className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors">
              Post your first campaign →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(campaign => {
              const isExpanded = expandedId === campaign.id
              const applicants = applicantsMap[campaign.id] || []
              const isLoadingApplicants = applicantsLoading[campaign.id]

              return (
                <div key={campaign.id} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] overflow-hidden">
                  {/* Campaign header */}
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[#F8FAFC] font-medium">{campaign.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            campaign.status === "Open"
                              ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                              : "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]"
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{campaign.niche}</span>
                          <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{campaign.platform}</span>
                          <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{campaign.budget}</span>
                          <span className="text-xs text-[#64748B]">Deadline: {campaign.deadline}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#F8FAFC]">{campaign.applicants}</p>
                          <p className="text-xs text-[#64748B]">applicant{campaign.applicants !== 1 ? "s" : ""}</p>
                        </div>
                        <button
                          onClick={() => toggleExpand(campaign.id)}
                          className="flex items-center gap-1.5 text-xs text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-colors"
                        >
                          {isExpanded ? "Hide" : "View"} Applicants
                          <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Applicants panel */}
                  {isExpanded && (
                    <div className="border-t border-[#1E1E2E] bg-[#0D0D1A]">
                      {isLoadingApplicants ? (
                        <div className="flex items-center justify-center py-8 text-purple-400 text-sm gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Loading applicants...
                        </div>
                      ) : applicants.length === 0 ? (
                        <div className="text-center py-8 text-sm text-[#64748B]">
                          No applications yet
                        </div>
                      ) : (
                        <div className="divide-y divide-[#1E1E2E]">
                          {applicants.map(app => {
                            const inf = app.influencer
                            const initials = inf?.initials || (inf?.name?.slice(0, 2)?.toUpperCase() ?? "??")
                            const isActioning = actionLoading === app.id
                            const alreadyActed = app.status !== "pending"

                            return (
                              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={`w-9 h-9 rounded-full ${colorMap[initials] || "bg-purple-500"} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
                                    {initials}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                      {inf ? (
                                        <a
                                          href={`/influencer/${inf.id}`}
                                          className="text-sm font-medium text-[#F8FAFC] hover:text-purple-400 transition-colors"
                                          onClick={e => e.stopPropagation()}
                                        >
                                          {inf.name}
                                        </a>
                                      ) : (
                                        <span className="text-sm font-medium text-[#94A3B8]">Unknown Influencer</span>
                                      )}
                                      {inf?.verified && (
                                        <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded-full">✓ Verified</span>
                                      )}
                                      {inf?.instagramVerified && (
                                        <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-1.5 py-0.5 rounded-full">IG ✓</span>
                                      )}
                                      {inf?.youtubeVerified && (
                                        <span className="text-xs bg-red-500/20 border border-red-500/40 text-red-300 px-1.5 py-0.5 rounded-full">YT ✓</span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 text-xs text-[#64748B]">
                                      {inf?.niche && <span>{inf.niche}</span>}
                                      {inf?.platform && <span>· {inf.platform}</span>}
                                      {inf?.aiScore != null && (
                                        <span className="text-purple-400">· AI Score: {inf.aiScore}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {alreadyActed ? (
                                    <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${STATUS_STYLES[app.status] ?? STATUS_STYLES.pending}`}>
                                      {STATUS_LABELS[app.status] ?? app.status}
                                    </span>
                                  ) : (
                                    <>
                                      <button
                                        disabled={isActioning}
                                        onClick={() => handleAction(app.id, campaign.id, "accepted")}
                                        className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-3 py-1.5 rounded-lg hover:bg-[#10B981]/20 transition-colors disabled:opacity-50"
                                      >
                                        {isActioning ? "…" : "✓ Accept"}
                                      </button>
                                      <button
                                        disabled={isActioning}
                                        onClick={() => handleAction(app.id, campaign.id, "rejected")}
                                        className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                      >
                                        {isActioning ? "…" : "✗ Reject"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
