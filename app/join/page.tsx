"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

export default function Join() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any

  const [form, setForm] = useState({
    name: "",
    handle: "",
    location: "",
    platform: "",
    niche: "",
    followers: "",
    engagementRate: "",
    pricePerPost: "",
    bio: "",
    phone: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fetchingProfile, setFetchingProfile] = useState(false)
  const [fetchStatus, setFetchStatus] = useState<"" | "success" | "error">("")

  // Auth gate
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/signup?role=influencer")
      return
    }
    if (user?.role && user.role !== "influencer") {
      router.replace("/dashboard")
      return
    }
  }, [status, user?.role])

  // Pre-fill name and email from session
  useEffect(() => {
    if (user?.name || user?.email) {
      setForm(p => ({
        ...p,
        name: p.name || user.name || "",
        handle: p.handle || (user.email ? `@${user.email.split("@")[0].replace(/[^a-z0-9]/gi, "_")}` : ""),
      }))
    }
  }, [user?.name, user?.email])

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleFetchProfile() {
    if (!form.handle || !form.platform) {
      setError("Enter your handle and select a platform first")
      return
    }
    setFetchingProfile(true)
    setFetchStatus("")
    setError("")
    try {
      const res = await fetch("/api/scrape-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: form.handle, platform: form.platform.toLowerCase().replace(" (twitter)", "").replace("x ", "x") }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFetchStatus("error")
      } else {
        setForm(p => ({
          ...p,
          name: data.fullName || p.name,
          bio: data.bio || p.bio,
          followers: data.followers ? String(data.followers) : p.followers,
        }))
        setFetchStatus("success")
      }
    } catch {
      setFetchStatus("error")
    } finally {
      setFetchingProfile(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.platform) { setError("Please select a platform"); return }
    if (!form.niche) { setError("Please select a niche"); return }

    setSubmitting(true)
    setError("")

    const res = await fetch("/api/influencers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        email: user?.email || "",
        userId: user?.id || "",
      }),
    })
    const data = await res.json()

    if (res.status === 409) {
      setError("Profile already exists — redirecting to dashboard")
      setTimeout(() => router.push("/dashboard"), 1500)
      return
    }
    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setSubmitting(false)
      return
    }

    router.push("/dashboard")
  }

  // Show nothing while redirecting non-influencers
  if (status === "loading" || (status === "authenticated" && user?.role !== "influencer")) {
    return (
      <main className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
      </main>
    )
  }

  const inputClass = "w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B]"
  const selectClass = `${inputClass} text-[#94A3B8]`

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 md:px-8 py-10 max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-purple-500/10 text-purple-400 text-sm px-4 py-1 rounded-full mb-4 border border-purple-500/20">
            For Influencers
          </div>
          <h1 className="text-3xl font-bold text-[#F8FAFC] mb-3 tracking-tight">
            Get discovered by top brands
          </h1>
          <p className="text-[#94A3B8]">
            List your profile for free. AI scores you automatically. Brands send proposals directly to you.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: "🆓", title: "Free listing", sub: "No cost to join" },
            { icon: "⚡", title: "AI scored", sub: "Auto verified" },
            { icon: "📩", title: "Direct proposals", sub: "Brands reach you" },
          ].map(b => (
            <div key={b.title} className="bg-[#12121A] rounded-xl p-4 text-center border border-[#1E1E2E]">
              <div className="text-2xl mb-2">{b.icon}</div>
              <div className="text-sm font-medium text-[#F8FAFC]">{b.title}</div>
              <div className="text-xs text-[#64748B] mt-1">{b.sub}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 md:p-8">
          <h2 className="font-semibold text-[#F8FAFC] mb-6">Your profile</h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Full name <span className="text-red-400">*</span></label>
                <input required type="text" value={form.name} onChange={e => set("name", e.target.value)}
                  className={inputClass} placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Handle / Username <span className="text-red-400">*</span></label>
                <div className="flex gap-2">
                  <input required type="text" value={form.handle} onChange={e => set("handle", e.target.value)}
                    className={inputClass} placeholder="@yourhandle" />
                  <button
                    type="button"
                    onClick={handleFetchProfile}
                    disabled={fetchingProfile || !form.handle || !form.platform}
                    className="flex-shrink-0 px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-500 disabled:opacity-40 transition-colors whitespace-nowrap"
                    title="Auto-fill from your profile"
                  >
                    {fetchingProfile ? "..." : "Auto-fill"}
                  </button>
                </div>
                {fetchingProfile && (
                  <p className="text-xs text-purple-400 mt-1.5 flex items-center gap-1.5">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Fetching your profile data...
                  </p>
                )}
                {fetchStatus === "success" && !fetchingProfile && (
                  <p className="text-xs text-[#10B981] mt-1.5">Profile data fetched successfully!</p>
                )}
                {fetchStatus === "error" && !fetchingProfile && (
                  <p className="text-xs text-red-400 mt-1.5">Could not fetch profile — please fill manually</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Primary platform <span className="text-red-400">*</span></label>
                <select required value={form.platform} onChange={e => set("platform", e.target.value)} className={selectClass}>
                  <option value="">Select platform</option>
                  <option>Instagram</option>
                  <option>YouTube</option>
                  <option>Facebook</option>
                  <option>LinkedIn</option>
                  <option>X (Twitter)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Your niche <span className="text-red-400">*</span></label>
                <select required value={form.niche} onChange={e => set("niche", e.target.value)} className={selectClass}>
                  <option value="">Select niche</option>
                  <option>Food</option>
                  <option>Tech</option>
                  <option>Fashion</option>
                  <option>Finance</option>
                  <option>Fitness</option>
                  <option>Travel</option>
                  <option>Gaming</option>
                  <option>Education</option>
                  <option>Entertainment</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">City / Location</label>
                <input type="text" value={form.location} onChange={e => set("location", e.target.value)}
                  className={inputClass} placeholder="Mumbai, Delhi, Bangalore..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Phone number</label>
                <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                  className={inputClass} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Follower count</label>
                <input type="text" value={form.followers} onChange={e => set("followers", e.target.value)}
                  className={inputClass} placeholder="e.g. 50K" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Engagement rate %</label>
                <input type="text" value={form.engagementRate} onChange={e => set("engagementRate", e.target.value)}
                  className={inputClass} placeholder="e.g. 4.2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Rate per post (₹)</label>
                <input type="text" value={form.pricePerPost} onChange={e => set("pricePerPost", e.target.value)}
                  className={inputClass} placeholder="e.g. 5000" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Bio <span className="text-[#64748B] font-normal">(optional)</span></label>
              <textarea value={form.bio} onChange={e => set("bio", e.target.value)}
                rows={3} className={`${inputClass} resize-none`}
                placeholder="Tell brands about yourself, your content style, and audience..." />
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg border border-red-500/20">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
            >
              {submitting ? "Submitting..." : "Submit my profile — free"}
            </button>

          </form>

          <p className="text-center text-xs text-[#64748B] mt-4">
            Your profile will be listed immediately and AI-scored within 24 hours.
          </p>
        </div>
      </div>
    </main>
  )
}
