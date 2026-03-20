"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState("")
  const [applySuccess, setApplySuccess] = useState("")

  const id = params?.id as string

  useEffect(() => {
    if (!id) return
    fetch(`/api/campaigns/${id}`)
      .then(r => r.json())
      .then(data => setCampaign(data.campaign ?? null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleApply() {
    const userId = (session?.user as any)?.id
    if (!userId) { router.push("/login"); return }
    setApplying(true)
    setApplyError("")
    const res = await fetch("/api/apply-campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: id, userId }),
    })
    const data = await res.json()
    setApplying(false)
    if (!res.ok) {
      if (data.error?.includes("already applied")) { setApplied(true); return }
      setApplyError(data.error || "Failed to apply")
      return
    }
    setApplied(true)
    setApplySuccess(`Applied! You now have ${data.newCredits} credits remaining.`)
  }

  const role = (session?.user as any)?.role
  const canApply = status === "authenticated" && role === "influencer" && !applied

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-purple-400 text-sm gap-3">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading campaign...
        </div>
      </main>
    )
  }

  if (!campaign) {
    return (
      <main className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-[#F8FAFC] font-medium mb-2">Campaign not found</div>
          <a href="/campaigns" className="text-purple-400 text-sm hover:underline">← Browse campaigns</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">

        <a href="/campaigns" className="text-[#64748B] hover:text-[#F8FAFC] text-sm transition-colors mb-8 inline-block">
          ← Back to campaigns
        </a>

        {/* Header */}
        <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {campaign.brandInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#F8FAFC]">{campaign.brand}</span>
                  {campaign.brandVerified && (
                    <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                  )}
                </div>
                <div className="text-xs text-[#64748B]">Brand</div>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium border flex-shrink-0 ${
              campaign.status === "Open"
                ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                : "bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20"
            }`}>{campaign.status}</span>
          </div>

          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">{campaign.title}</h1>
          <p className="text-[#94A3B8] leading-relaxed">{campaign.description}</p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Niche", value: campaign.niche, icon: "🎯" },
            { label: "Platform", value: campaign.platform, icon: "📱" },
            { label: "Budget", value: campaign.budget, icon: "💰" },
            { label: "Deadline", value: campaign.deadline, icon: "📅" },
            { label: "Location", value: campaign.location, icon: "📍" },
            { label: "Min Followers", value: campaign.minFollowers, icon: "👥" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-[#12121A] rounded-xl border border-[#1E1E2E] p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{icon}</span>
                <span className="text-xs text-[#64748B]">{label}</span>
              </div>
              <div className="text-sm font-medium text-[#F8FAFC]">{value || "—"}</div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-8">
          <div className="bg-[#12121A] rounded-xl border border-[#1E1E2E] px-4 py-3 text-sm">
            <span className="text-[#64748B]">Slots: </span>
            <span className="text-[#F8FAFC] font-medium">{campaign.slots}</span>
          </div>
          <div className="bg-[#12121A] rounded-xl border border-[#1E1E2E] px-4 py-3 text-sm">
            <span className="text-[#64748B]">Applicants: </span>
            <span className="text-[#F8FAFC] font-medium">{campaign.applicants}</span>
          </div>
        </div>

        {/* Apply section */}
        {applySuccess && (
          <div className="bg-[#10B981]/10 text-[#10B981] px-4 py-3 rounded-xl border border-[#10B981]/20 text-sm mb-4">
            {applySuccess}
          </div>
        )}
        {applyError && (
          <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl border border-red-500/20 text-sm mb-4">
            {applyError}
          </div>
        )}
        {applied && !applySuccess && (
          <div className="bg-[#10B981]/10 text-[#10B981] px-4 py-3 rounded-xl border border-[#10B981]/20 text-sm mb-4">
            ✓ You have already applied to this campaign.
          </div>
        )}

        {canApply && campaign.status === "Open" && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
          >
            {applying ? "Applying..." : "Apply to Campaign — 2 credits"}
          </button>
        )}
        {status === "unauthenticated" && (
          <a href="/login" className="block w-full text-center bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-500 transition-colors">
            Log in to apply
          </a>
        )}
        {status === "authenticated" && role === "brand" && (
          <div className="text-center text-sm text-[#64748B] py-3">
            Only influencer accounts can apply to campaigns.
          </div>
        )}

      </div>
    </main>
  )
}
