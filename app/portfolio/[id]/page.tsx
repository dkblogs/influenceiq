"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/app/components/Navbar"

export default function PortfolioPage() {
  const params = useParams()
  const [influencer, setInfluencer] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [infRes, portRes] = await Promise.all([
        fetch(`/api/influencers/${params.id}`),
        fetch(`/api/portfolio?influencerId=${params.id}`),
      ])
      const infData = await infRes.json()
      const portData = await portRes.json()
      setInfluencer(infData.influencer)
      setItems(portData.items || [])
      setLoading(false)
    }
    if (params.id) load()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#64748B] text-sm">Loading...</div>
      </main>
    )
  }

  if (!influencer) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#64748B] text-sm">Influencer not found</div>
      </main>
    )
  }

  const colorMap: Record<string, string> = {
    PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
    VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
    MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 md:px-8 py-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl ${colorMap[influencer.initials] || "bg-purple-500"} flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}>
            {influencer.initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">{influencer.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">{influencer.niche}</span>
              <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{influencer.platform}</span>
              {influencer.verified && (
                <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">✓ Verified</span>
              )}
            </div>
          </div>
          <a
            href={`/influencer/${influencer.id}`}
            className="ml-auto text-sm text-purple-400 hover:text-purple-300 transition-colors whitespace-nowrap"
          >
            View full profile →
          </a>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC]">
            Portfolio <span className="text-[#64748B] font-normal text-sm ml-1">({items.length} collaboration{items.length !== 1 ? "s" : ""})</span>
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-12 text-center">
            <div className="text-4xl mb-3">📂</div>
            <p className="font-medium text-[#94A3B8] mb-1">No portfolio items yet</p>
            <p className="text-sm text-[#64748B]">This influencer hasn't added any collaborations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}

function PortfolioCard({ item }: { item: any }) {
  return (
    <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 hover:border-purple-500/30 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs text-purple-400 font-medium uppercase tracking-wide mb-0.5">{item.brandName}</div>
          <h3 className="font-semibold text-[#F8FAFC] text-sm leading-snug">{item.campaignTitle}</h3>
        </div>
        {item.completedAt && (
          <span className="text-xs text-[#64748B] whitespace-nowrap flex-shrink-0 mt-0.5">
            {new Date(item.completedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
          </span>
        )}
      </div>

      {item.description && (
        <p className="text-sm text-[#94A3B8] mb-3 leading-relaxed">{item.description}</p>
      )}

      <div className="space-y-2">
        {item.deliverables && (
          <div className="bg-[#0D0D1A] rounded-lg px-3 py-2">
            <div className="text-xs text-[#64748B] font-medium mb-0.5">Deliverables</div>
            <div className="text-xs text-[#94A3B8]">{item.deliverables}</div>
          </div>
        )}
        {item.results && (
          <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-lg px-3 py-2">
            <div className="text-xs text-[#10B981] font-medium mb-0.5">Results</div>
            <div className="text-xs text-[#94A3B8]">{item.results}</div>
          </div>
        )}
      </div>

      {item.mediaUrl && (
        <a
          href={item.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <span>🔗</span> View campaign media
        </a>
      )}
    </div>
  )
}
