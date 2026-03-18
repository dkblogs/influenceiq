"use client"
import { useState } from "react"
import Navbar from "@/app/components/Navbar"

const allBrands = [
  { name: "FreshKart", industry: "Food & Grocery", location: "Mumbai", size: "Startup", budget: "₹10K–50K", platforms: ["Instagram", "YouTube"], looking: ["Food", "Lifestyle"], initials: "FK", color: "bg-orange-500", about: "Online grocery delivery startup expanding to 10 new cities.", verified: true },
  { name: "ZenFit", industry: "Health & Fitness", location: "Bangalore", size: "Startup", budget: "₹5K–20K", platforms: ["Instagram"], looking: ["Fitness", "Health"], initials: "ZF", color: "bg-green-500", about: "AI-powered fitness app with 200K active users." },
  { name: "PayEasy", industry: "Fintech", location: "Delhi", size: "Mid-size", budget: "₹50K–2L", platforms: ["YouTube", "LinkedIn"], looking: ["Finance", "Tech"], initials: "PE", color: "bg-blue-500", about: "Digital payments platform targeting small businesses.", verified: true },
  { name: "StyleHub", industry: "Fashion", location: "Mumbai", size: "Mid-size", budget: "₹20K–1L", platforms: ["Instagram"], looking: ["Fashion", "Lifestyle"], initials: "SH", color: "bg-pink-500", about: "Premium Indian ethnic wear brand going national.", verified: true },
  { name: "TechNova", industry: "Technology", location: "Hyderabad", size: "Enterprise", budget: "₹1L–5L", platforms: ["YouTube", "LinkedIn", "X"], looking: ["Tech", "Gaming"], initials: "TN", color: "bg-indigo-500", about: "B2B software company launching consumer product line.", verified: true },
  { name: "HealthPlus", industry: "Healthcare", location: "Chennai", size: "Startup", budget: "₹10K–30K", platforms: ["Instagram", "YouTube"], looking: ["Health", "Fitness", "Food"], initials: "HP", color: "bg-teal-500", about: "Ayurvedic wellness brand with D2C ambitions." },
  { name: "EduLearn", industry: "Education", location: "Pune", size: "Mid-size", budget: "₹15K–60K", platforms: ["YouTube", "Instagram"], looking: ["Education", "Tech"], initials: "EL", color: "bg-yellow-500", about: "Ed-tech platform for competitive exam preparation." },
  { name: "FoodBox", industry: "Food & Beverage", location: "Kolkata", size: "Startup", budget: "₹5K–25K", platforms: ["Instagram"], looking: ["Food", "Lifestyle"], initials: "FB", color: "bg-red-500", about: "Healthy snack subscription box launching pan-India." },
]

const industries = ["All", "Food & Grocery", "Health & Fitness", "Fintech", "Fashion", "Technology", "Healthcare", "Education", "Food & Beverage"]
const sizes = ["All", "Startup", "Mid-size", "Enterprise"]

export default function Brands() {
  const [selectedIndustry, setSelectedIndustry] = useState("All")
  const [selectedSize, setSelectedSize] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = allBrands.filter((b) => {
    const matchIndustry = selectedIndustry === "All" || b.industry === selectedIndustry
    const matchSize = selectedSize === "All" || b.size === selectedSize
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.industry.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase())
    return matchIndustry && matchSize && matchSearch
  })

  return (
    <main className="min-h-screen bg-[#0A0A0F]">

      <Navbar />

      <div className="px-4 md:px-8 py-8 md:py-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-purple-500/10 text-purple-400 text-xs px-3 py-1 rounded-full mb-3 border border-purple-500/20">For Influencers</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC] mb-1">Discover Brands</h1>
          <p className="text-[#94A3B8] text-sm">Browse brands actively looking for influencer partnerships. Send them a collaboration request directly.</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#12121A] text-[#F8FAFC] placeholder-[#64748B]"
            placeholder="Search by brand name, industry, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Industry filters */}
        <div className="mb-4">
          <div className="text-xs text-[#64748B] mb-2 font-medium uppercase tracking-wide">Industry</div>
          <div className="flex gap-2 flex-wrap">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedIndustry === ind
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Size filters */}
        <div className="mb-8">
          <div className="text-xs text-[#64748B] mb-2 font-medium uppercase tracking-wide">Company size</div>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedSize === s
                    ? "bg-[#F8FAFC] text-[#0A0A0F]"
                    : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50 hover:text-[#F8FAFC]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-[#64748B] mb-4">
          Showing {filtered.length} brand{filtered.length !== 1 ? "s" : ""}
          {selectedIndustry !== "All" && ` in ${selectedIndustry}`}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium text-[#94A3B8] mb-1">No brands found</div>
            <div className="text-sm">Try a different industry or size</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((brand) => (
              <div key={brand.name} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all hover:-translate-y-0.5">

                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${brand.color} flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}>
                    {brand.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[#F8FAFC]">{brand.name}</span>
                      {brand.verified && (
                        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                      )}
                    </div>
                    <div className="text-xs text-[#64748B]">{brand.industry} · {brand.location}</div>
                    <div className="flex gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        brand.size === "Enterprise" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                        brand.size === "Mid-size" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                      }`}>
                        {brand.size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* About */}
                <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">{brand.about}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Campaign budget</span>
                    <span className="font-medium text-[#F8FAFC]">{brand.budget}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Platforms</span>
                    <span className="font-medium text-[#F8FAFC]">{brand.platforms.join(", ")}</span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <span className="text-[#64748B]">Looking for</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {brand.looking.map((niche) => (
                        <span key={niche} className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">{niche}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
                    Send request — 10 cr
                  </button>
                  <button className="flex-1 border border-[#1E1E2E] text-[#94A3B8] py-2 rounded-lg text-xs hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors">
                    View campaigns
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-8 text-center text-sm text-[#64748B] mt-8">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}
