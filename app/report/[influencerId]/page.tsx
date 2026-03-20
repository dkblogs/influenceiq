"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

const ANALYSIS_SECTIONS = [
  { key: "engagementAnalysis", label: "Engagement Analysis", icon: "📊" },
  { key: "nicheStrength", label: "Niche Strength", icon: "🎯" },
  { key: "contentConsistency", label: "Content Consistency", icon: "📅" },
  { key: "growthPotential", label: "Growth Potential", icon: "📈" },
  { key: "brandCollaborationReadiness", label: "Brand Collaboration Readiness", icon: "🤝" },
]

function ScoreBadge({ score }: { score: number }) {
  const hex = score >= 70 ? "#10B981" : score >= 40 ? "#FBBF24" : "#F87171"
  const ringClass = score >= 70 ? "stroke-[#10B981]" : score >= 40 ? "stroke-yellow-400" : "stroke-red-400"
  const pct = (score / 100) * 251.2
  return (
    <div className="relative flex-shrink-0">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1E1E2E" strokeWidth="8" />
        <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8"
          strokeDasharray={`${pct} 251.2`} strokeLinecap="round" className={ringClass} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: hex }}>{score}</span>
        <span className="text-xs text-[#64748B]">/ 100</span>
      </div>
    </div>
  )
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [influencer, setInfluencer] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const influencerId = params?.influencerId as string

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status !== "authenticated") return

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/influencers/${influencerId}`)
        const data = await res.json()
        if (!res.ok || !data.influencer) { setError("Report not found"); return }

        const inf = data.influencer
        // Only the influencer themselves can view this page
        if (inf.userId !== (session?.user as any)?.id) {
          setError("You don't have permission to view this report")
          return
        }
        if (!inf.aiReportFull) { setError("No AI report generated yet. Go to your dashboard to generate one."); return }

        setInfluencer(inf)
        setReport(JSON.parse(inf.aiReportFull))
      } catch {
        setError("Failed to load report")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [status, influencerId, session])

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-purple-400 text-sm gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading report...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-[#F8FAFC] font-medium mb-2">{error}</div>
          <a href="/dashboard" className="text-purple-400 text-sm hover:underline">← Back to Dashboard</a>
        </div>
      </main>
    )
  }

  const scoreLabel = report.score >= 70 ? "Strong profile" : report.score >= 40 ? "Room to grow" : "Needs improvement"

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">

        {/* Header */}
        <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <ScoreBadge score={report.score} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-[#F8FAFC]">{influencer.name}</h1>
                {influencer.verified && (
                  <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-cyan-500/20">✓ InfluenceIQ Verified</span>
                )}
                {influencer.instagramVerified && (
                  <span className="bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs px-2 py-0.5 rounded-full">✓ Instagram</span>
                )}
                {influencer.youtubeVerified && (
                  <span className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-2 py-0.5 rounded-full">✓ YouTube</span>
                )}
              </div>
              <div className="text-sm text-[#64748B] mb-3">{influencer.niche} · {influencer.platform} · {influencer.location}</div>
              <div className="text-sm text-[#94A3B8] leading-relaxed mb-3">{report.summary}</div>
              <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                report.score >= 70
                  ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                  : report.score >= 40
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                  : "bg-red-400/10 text-red-400 border border-red-400/20"
              }`}>{scoreLabel}</div>
            </div>
          </div>
        </div>

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {ANALYSIS_SECTIONS.map(({ key, label, icon }) => (
            <div key={key} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-[#F8FAFC]">{label}</span>
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{report[key]}</p>
            </div>
          ))}
        </div>

        {/* Strengths + Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5">
            <div className="text-sm font-semibold text-[#10B981] mb-3">✓ Strengths</div>
            <ul className="space-y-2">
              {report.strengths?.map((s: string, i: number) => (
                <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                  <span className="text-[#10B981] flex-shrink-0 mt-0.5">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
            <div className="text-sm font-semibold text-amber-400 mb-3">→ Areas to Improve</div>
            <ul className="space-y-2">
              {report.improvements?.map((s: string, i: number) => (
                <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                  <span className="text-amber-400 flex-shrink-0 mt-0.5">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ideal Brand Categories */}
        {report.idealBrandCategories?.length > 0 && (
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5 mb-6">
            <div className="text-sm font-semibold text-purple-400 mb-3">Ideal Brand Categories</div>
            <div className="flex flex-wrap gap-2">
              {report.idealBrandCategories.map((cat: string, i: number) => (
                <span key={i} className="bg-purple-500/10 text-purple-300 text-sm px-3 py-1 rounded-full border border-purple-500/20">{cat}</span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748B]">
          <span>
            Report generated on{" "}
            {influencer.aiReportGeneratedAt
              ? new Date(influencer.aiReportGeneratedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </span>
          <div className="flex gap-3">
            <a href="/dashboard" className="text-purple-400 hover:underline">← Dashboard</a>
          </div>
        </div>

      </div>
    </main>
  )
}
