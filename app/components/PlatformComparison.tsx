"use client"

import { useState } from "react"

const rows = [
  ["Commission on deals", "✅ 0% — Forever free", "❌ 10%–30% per deal"],
  ["Hidden fees", "✅ None", "❌ Monthly subscriptions + fees"],
  ["Influencer discovery", "✅ Free to browse", "❌ Paid plans required"],
  ["Profile listing", "✅ Free for influencers", "❌ Paid or commission-based"],
  ["Credits expiry", "✅ Never expire", "❌ Monthly reset"],
  ["AI-powered matching", "✅ Included", "❌ Premium add-on"],
]

const COMMISSION_RATES = [10, 15, 20, 25, 30]

export default function PlatformComparison({ heading, subheading }: { heading: string; subheading: string }) {
  const [dealValue, setDealValue] = useState(50000)
  const [dealsPerMonth, setDealsPerMonth] = useState(3)
  const [commissionRate, setCommissionRate] = useState(20)

  const monthlyCharge = Math.round((dealValue * dealsPerMonth * commissionRate) / 100)
  const annualSavings = monthlyCharge * 12

  return (
    <section className="px-8 py-20 bg-[#0A0A0F]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">{heading}</h2>
          <p className="text-gray-400 text-lg">{subheading}</p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl overflow-hidden border border-[#1E1E2E] mb-14">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-900/60 to-purple-800/40">
                <th className="text-left px-6 py-4 font-semibold text-gray-300">Feature</th>
                <th className="px-6 py-4 font-semibold text-purple-300 text-center">InfluenceIQ</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-center">Other Platforms</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([feature, iq, other], i) => (
                <tr key={i} className={`border-t border-[#1E1E2E] ${i % 2 === 0 ? "bg-[#0D0D14]" : "bg-[#0A0A0F]"}`}>
                  <td className="px-6 py-4 text-gray-300">{feature}</td>
                  <td className="px-6 py-4 text-center text-green-400 font-medium">{iq}</td>
                  <td className="px-6 py-4 text-center text-red-400">{other}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Savings Calculator */}
        <div className="bg-[#0D0D14] border border-[#1E1E2E] rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-2">Savings Calculator</h3>
          <p className="text-gray-400 text-sm mb-8">See how much you save by switching to InfluenceIQ.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Monthly deal value (₹)</label>
              <input
                type="number"
                value={dealValue}
                min={1000}
                step={1000}
                onChange={e => setDealValue(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Deals per month</label>
              <input
                type="number"
                value={dealsPerMonth}
                min={1}
                onChange={e => setDealsPerMonth(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">
                Their commission rate: <span className="text-purple-400 font-semibold">{commissionRate}%</span>
              </label>
              <div className="flex gap-2 flex-wrap mt-1">
                {COMMISSION_RATES.map(rate => (
                  <button
                    key={rate}
                    onClick={() => setCommissionRate(rate)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      commissionRate === rate
                        ? "bg-purple-600 text-white"
                        : "bg-[#0A0A0F] border border-[#2A2A3E] text-gray-400 hover:border-purple-500"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl p-5">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">What others charge you</div>
              <div className="text-2xl font-bold text-red-400">₹{monthlyCharge.toLocaleString("en-IN")}</div>
              <div className="text-xs text-gray-500 mt-1">per month</div>
            </div>
            <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl p-5">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">What InfluenceIQ charges</div>
              <div className="text-2xl font-bold text-green-400">₹0</div>
              <div className="text-xs text-gray-500 mt-1">zero commission, ever</div>
            </div>
            <div className="bg-purple-900/30 border border-purple-700/40 rounded-xl p-5">
              <div className="text-xs text-purple-300 uppercase tracking-wide mb-1">Your monthly savings</div>
              <div className="text-2xl font-bold text-green-300">₹{monthlyCharge.toLocaleString("en-IN")}</div>
              <div className="text-xs text-purple-300 mt-1">back in your pocket</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              ₹{annualSavings.toLocaleString("en-IN")} saved annually
            </div>
            <div className="text-gray-400 text-sm">That&apos;s money back in your pocket — invest it in more campaigns.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
