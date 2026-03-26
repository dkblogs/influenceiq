"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function CampaignsAppliedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    if ((session?.user as any)?.role !== "influencer") { router.push("/dashboard"); return }

    fetch("/api/my-applications")
      .then(r => r.json())
      .then(data => setApplications(data.applications || []))
      .finally(() => setLoading(false))
  }, [status, session, router])

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">

        <div className="flex items-center gap-4 mb-8">
          <a href="/dashboard" className="text-[#64748B] hover:text-[#F8FAFC] text-sm transition-colors">← Dashboard</a>
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Campaigns Applied</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Your campaign application history</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-purple-400 text-sm gap-3">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <div className="text-[#F8FAFC] font-medium mb-2">No applications yet</div>
            <div className="text-sm text-[#64748B] mb-6">You haven&apos;t applied to any campaigns yet.</div>
            <a href="/campaigns" className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors">
              Browse open campaigns →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <a
                key={app.id}
                href={app.campaign?.id ? `/campaigns/${app.campaign.id}` : "#"}
                className="block bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[#F8FAFC] font-medium truncate">{app.campaign?.title ?? "Unknown Campaign"}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLES[app.status] ?? STATUS_STYLES.pending}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm text-[#64748B] mb-2">{app.campaign?.brandName}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-[#94A3B8]">
                      {app.campaign?.niche && <span className="bg-[#1E1E2E] px-2 py-0.5 rounded">{app.campaign.niche}</span>}
                      {app.campaign?.platform && <span className="bg-[#1E1E2E] px-2 py-0.5 rounded">{app.campaign.platform}</span>}
                      {app.campaign?.budget && <span className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">{app.campaign.budget}</span>}
                      {app.campaign?.location && <span className="bg-[#1E1E2E] px-2 py-0.5 rounded">{app.campaign.location}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-[#64748B] whitespace-nowrap flex-shrink-0">
                    Applied {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                  </div>
                </div>
                {app.campaign?.deadline && (
                  <div className="mt-3 text-xs text-[#64748B]">Deadline: {app.campaign.deadline}</div>
                )}
              </a>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
