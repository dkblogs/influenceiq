"use client"
import { useState, useEffect } from "react"
import Navbar from "@/app/components/Navbar"

const colorMap: Record<number, string> = {
  0: "bg-purple-500", 1: "bg-blue-500", 2: "bg-green-500",
  3: "bg-orange-500", 4: "bg-pink-500", 5: "bg-teal-500",
  6: "bg-indigo-500", 7: "bg-yellow-500",
}

function initials(name: string) {
  const parts = (name || "").trim().split(" ")
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function DiscoverBrands() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState("")

  useEffect(() => {
    fetch("/api/brands")
      .then(r => r.json())
      .then(d => { setBrands(d.brands || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = brands.filter(b =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase())
  )

  function showComingSoon() {
    setToast("Brand profile pages coming soon!")
    setTimeout(() => setToast(""), 2500)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#12121A] border border-[#1E1E2E] text-[#F8FAFC] text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="px-4 py-6 max-w-6xl mx-auto">

        <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC] mb-1">Discover Brands</h1>
        <p className="text-sm text-[#94A3B8] mb-4">Browse brands on InfluenceIQ looking to collaborate with influencers.</p>

        <input
          className="w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#12121A] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 mb-6"
          placeholder="Search brands by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <p className="text-xs text-[#64748B] mb-4">
          {loading ? "Loading..." : `${filtered.length} brand${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E1E2E]"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-[#1E1E2E] rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-[#1E1E2E] rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏢</div>
            <p className="font-medium text-[#94A3B8] mb-1">No brands found</p>
            <p className="text-sm text-[#64748B]">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((brand: any, idx: number) => (
              <button
                key={brand.id}
                onClick={showComingSoon}
                className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-4 text-left hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full ${colorMap[idx % 8]} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                    {initials(brand.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[#F8FAFC] text-sm truncate">{brand.name}</span>
                      {brand.brandVerified && (
                        <span className="text-cyan-400 text-xs flex-shrink-0">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B]">Joined {timeAgo(brand.createdAt)}</p>
                  </div>
                </div>

                {brand.brandVerified ? (
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    Verified Brand
                  </span>
                ) : (
                  <span className="text-xs bg-[#1E1E2E] text-[#64748B] px-2 py-0.5 rounded-full">
                    Unverified
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
