"use client"

import { useState, useEffect } from "react"

const NICHE_BENCHMARKS: Record<string, { ctr: number; convRate: number; avgOrder: number }> = {
  Fashion:       { ctr: 0.028, convRate: 0.032, avgOrder: 2200 },
  Beauty:        { ctr: 0.031, convRate: 0.035, avgOrder: 1800 },
  Tech:          { ctr: 0.022, convRate: 0.028, avgOrder: 8500 },
  Food:          { ctr: 0.025, convRate: 0.020, avgOrder: 600 },
  Travel:        { ctr: 0.020, convRate: 0.015, avgOrder: 12000 },
  Fitness:       { ctr: 0.026, convRate: 0.030, avgOrder: 2500 },
  Gaming:        { ctr: 0.035, convRate: 0.040, avgOrder: 1500 },
  Education:     { ctr: 0.018, convRate: 0.025, avgOrder: 3500 },
  Finance:       { ctr: 0.015, convRate: 0.020, avgOrder: 5000 },
  Lifestyle:     { ctr: 0.024, convRate: 0.028, avgOrder: 2000 },
  Entertainment: { ctr: 0.030, convRate: 0.018, avgOrder: 800 },
  Health:        { ctr: 0.022, convRate: 0.028, avgOrder: 1800 },
  Default:       { ctr: 0.024, convRate: 0.025, avgOrder: 2000 },
}

function estimateReach(followers: number, engagementRate: number): number {
  const baseReach = 0.25
  const engBonus = Math.min(engagementRate / 100, 0.15)
  return Math.round(followers * (baseReach + engBonus))
}

function calculateROI(inputs: {
  budget: number
  influencerCount: number
  avgFollowers: number
  engagementRate: number
  niche: string
}) {
  const { budget, influencerCount, avgFollowers, engagementRate, niche } = inputs
  if (!budget || !influencerCount || !avgFollowers || !engagementRate) return null

  const benchmarks = NICHE_BENCHMARKS[niche] || NICHE_BENCHMARKS.Default

  const reachPerInfluencer = estimateReach(avgFollowers, engagementRate)
  const totalReach = reachPerInfluencer * influencerCount
  const estImpressions = Math.round(totalReach * 1.4)
  const cpm = estImpressions > 0 ? parseFloat(((budget / estImpressions) * 1000).toFixed(2)) : 0
  const estClicks = Math.round(estImpressions * benchmarks.ctr)
  const estConversions = Math.round(estClicks * benchmarks.convRate)
  const estRevenue = Math.round(estConversions * benchmarks.avgOrder)
  const cpa = estConversions > 0 ? parseFloat((budget / estConversions).toFixed(2)) : 0
  const roiPercent = budget > 0 ? parseFloat((((estRevenue - budget) / budget) * 100).toFixed(1)) : 0

  return { totalReach, estImpressions, cpm, estClicks, estConversions, estRevenue, cpa, roiPercent }
}

function formatINR(num: number): string {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`
  return `₹${Math.round(num).toLocaleString("en-IN")}`
}

function formatNum(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString("en-IN")
}

interface ROICalculatorProps {
  campaigns: { id: string; title: string }[]
}

export default function ROICalculator({ campaigns }: ROICalculatorProps) {
  const [open, setOpen] = useState(false)
  const [inputs, setInputs] = useState({
    budget: "",
    influencerCount: "",
    avgFollowers: "",
    engagementRate: "",
    niche: "Fashion",
  })
  const [results, setResults] = useState<any>(null)
  const [selectedCampaign, setSelectedCampaign] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    const parsed = {
      budget: parseFloat(inputs.budget) || 0,
      influencerCount: parseInt(inputs.influencerCount) || 0,
      avgFollowers: parseInt(inputs.avgFollowers) || 0,
      engagementRate: parseFloat(inputs.engagementRate) || 0,
      niche: inputs.niche,
    }
    setResults(calculateROI(parsed))
    setSaved(false)
  }, [inputs])

  async function saveToCampaign() {
    if (!selectedCampaign || !results) return
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch(`/api/campaigns/${selectedCampaign}/roi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: parseFloat(inputs.budget),
          influencerCount: parseInt(inputs.influencerCount),
          avgFollowers: parseInt(inputs.avgFollowers),
          engagementRate: parseFloat(inputs.engagementRate),
          niche: inputs.niche,
          ...results,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaved(true)
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const niches = Object.keys(NICHE_BENCHMARKS).filter(n => n !== "Default")

  const inputClass = "w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#1E293B]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📈</span>
          <div className="text-left">
            <h3 className="text-white font-semibold">Campaign ROI Calculator</h3>
            <p className="text-gray-400 text-xs mt-0.5">Estimate reach, conversions & ROI before launching</p>
          </div>
        </div>
        <span className="text-gray-400 text-lg">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-[#1E293B]">

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Total Budget (₹)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={inputs.budget}
                onChange={e => setInputs({ ...inputs, budget: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Number of Influencers</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={inputs.influencerCount}
                onChange={e => setInputs({ ...inputs, influencerCount: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Avg Followers per Influencer</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={inputs.avgFollowers}
                onChange={e => setInputs({ ...inputs, avgFollowers: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Avg Engagement Rate (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 3.5"
                value={inputs.engagementRate}
                onChange={e => setInputs({ ...inputs, engagementRate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-400 text-xs mb-1.5 block">Campaign Niche</label>
              <div className="flex flex-wrap gap-2">
                {niches.map(n => (
                  <button
                    key={n}
                    onClick={() => setInputs({ ...inputs, niche: n })}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      inputs.niche === n
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "border-[#334155] text-gray-400 hover:border-indigo-500/50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {results ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-medium text-sm">Estimated Results</h4>
                <span className="text-xs text-gray-500">Based on Indian creator economy benchmarks</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Reach",  value: formatNum(results.totalReach),    color: "text-blue-400" },
                  { label: "Impressions",  value: formatNum(results.estImpressions), color: "text-purple-400" },
                  { label: "Est. Clicks",  value: formatNum(results.estClicks),      color: "text-cyan-400" },
                  { label: "Conversions",  value: formatNum(results.estConversions), color: "text-green-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#1E293B] rounded-xl p-3 text-center">
                    <div className={`text-lg font-bold ${color}`}>{value}</div>
                    <div className="text-gray-400 text-xs mt-1">{label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Est. Revenue", value: formatINR(results.estRevenue), color: "text-emerald-400" },
                  { label: "CPM",          value: formatINR(results.cpm),        color: "text-amber-400" },
                  { label: "CPA",          value: formatINR(results.cpa),        color: "text-orange-400" },
                  {
                    label: "ROI",
                    value: `${results.roiPercent > 0 ? "+" : ""}${results.roiPercent}%`,
                    color: results.roiPercent >= 0 ? "text-green-400" : "text-red-400",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#1E293B] rounded-xl p-3 text-center">
                    <div className={`text-lg font-bold ${color}`}>{value}</div>
                    <div className="text-gray-400 text-xs mt-1">{label}</div>
                  </div>
                ))}
              </div>

              <div className={`rounded-xl p-3 border text-sm ${
                results.roiPercent >= 100
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : results.roiPercent >= 0
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {results.roiPercent >= 200
                  ? "🚀 Excellent ROI — this campaign looks very profitable"
                  : results.roiPercent >= 100
                  ? "✅ Strong ROI — solid expected return on investment"
                  : results.roiPercent >= 0
                  ? "⚠️ Moderate ROI — consider increasing engagement rate or reducing budget"
                  : "❌ Negative ROI — adjust budget, influencer count, or niche"}
              </div>

              {campaigns.length > 0 && (
                <div className="border-t border-[#1E293B] pt-3 space-y-2">
                  <label className="text-gray-400 text-xs block">Save results to campaign</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCampaign}
                      onChange={e => { setSelectedCampaign(e.target.value); setSaved(false) }}
                      className={`flex-1 ${inputClass}`}
                    >
                      <option value="">Select a campaign...</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={saveToCampaign}
                      disabled={!selectedCampaign || saving || saved}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        saved
                          ? "bg-green-600 text-white"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                      }`}
                    >
                      {saving ? "Saving..." : saved ? "✓ Saved" : "Save"}
                    </button>
                  </div>
                  {saveError && <p className="text-red-400 text-xs">{saveError}</p>}
                </div>
              )}

              <p className="text-gray-600 text-xs">
                * Estimates based on Indian influencer market benchmarks. Actual results may vary.
              </p>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              Fill in all fields above to see estimated ROI
            </div>
          )}
        </div>
      )}
    </div>
  )
}
