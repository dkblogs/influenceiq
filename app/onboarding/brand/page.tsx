"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { INDUSTRIES } from "@/lib/constants"

const STEPS = ["Account", "Company Details", "First Campaign"]

export default function BrandOnboarding() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any

  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Company details form
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [phone, setPhone] = useState("")
  const [about, setAbout] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && user?.role !== "brand") router.push("/dashboard")
  }, [status, user, router])

  if (status === "loading" || status !== "authenticated") {
    return <div className="min-h-screen bg-[#0A0A0F]" />
  }

  async function saveCompanyDetails() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, industry, location, website, phone, about }),
      })
      if (!res.ok) { setError("Failed to save. Please try again."); return }
      setStep(3)
    } catch {
      setError("Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  const completedSteps = step - 1

  if (done) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-5">🎉</div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-3">Welcome aboard!</h1>
          <p className="text-[#94A3B8] text-sm mb-10">Your brand account is ready. What would you like to do first?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/campaigns/post"
              className="bg-purple-600 text-white rounded-xl p-6 hover:bg-purple-500 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📢</div>
              <div className="font-semibold text-[#F8FAFC] mb-1">Post Your First Campaign</div>
              <div className="text-xs text-purple-200">Reach verified creators now</div>
            </a>
            <a
              href="/discover/influencers"
              className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-6 hover:border-purple-500/40 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-semibold text-[#F8FAFC] mb-1">Browse Influencers</div>
              <div className="text-xs text-[#64748B]">Discover creators by niche</div>
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-semibold text-[#F8FAFC]">Influence<span className="text-purple-400">IQ</span></span>
          </a>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i + 1 < step ? "bg-[#10B981] text-white" :
                  i + 1 === step ? "bg-purple-600 text-white" :
                  "bg-[#1E1E2E] text-[#64748B]"
                }`}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i + 1 <= step ? "text-[#94A3B8]" : "text-[#64748B]"}`}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${i + 1 < step ? "bg-[#10B981]" : "bg-[#1E1E2E]"}`} style={{ width: "40px" }} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-[#1E1E2E] rounded-full">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="text-xs text-[#64748B] mt-1.5">Step {step} of {STEPS.length}</div>
        </div>

        <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-7">

          {/* Step 1 — Account */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[#10B981] text-lg">✅</span>
                <h2 className="text-lg font-bold text-[#F8FAFC]">Account Created</h2>
              </div>
              <div className="space-y-3 mb-6">
                <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-2.5">
                  <div className="text-xs text-[#64748B] mb-0.5">Name</div>
                  <div className="text-sm text-[#F8FAFC]">{user?.name}</div>
                </div>
                <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-2.5">
                  <div className="text-xs text-[#64748B] mb-0.5">Email</div>
                  <div className="text-sm text-[#F8FAFC]">{user?.email}</div>
                </div>
                <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-2.5">
                  <div className="text-xs text-[#64748B] mb-0.5">Role</div>
                  <div className="text-sm text-purple-400 font-medium">Brand</div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-colors"
              >
                Continue → Add Company Details
              </button>
            </div>
          )}

          {/* Step 2 — Company Details */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] mb-1">Company Details</h2>
              <p className="text-[#64748B] text-xs mb-5">Complete your brand profile — influencers trust verified brands more</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
              )}

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Company Name</label>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp" className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Industry</label>
                    <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] focus:outline-none focus:border-purple-500">
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Location</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Mumbai, India" className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Phone</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Website</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourcompany.com" className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">About your brand</label>
                  <textarea value={about} onChange={e => setAbout(e.target.value)} rows={3} placeholder="Tell influencers what your brand is about..." className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 resize-none" />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveCompanyDetails}
                  disabled={saving}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-purple-500 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : "Save & Continue →"}
                </button>
              </div>
              <button
                onClick={() => setStep(3)}
                className="w-full mt-2 text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors py-2 flex items-center justify-center gap-1"
              >
                Skip for now ⚠️
                <span className="text-amber-400 text-[10px] ml-1">(incomplete profiles get less trust)</span>
              </button>
            </div>
          )}

          {/* Step 3 — First Campaign */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] mb-1">Post Your First Campaign</h2>
              <p className="text-[#64748B] text-xs mb-6">Brands with active campaigns get 5× more influencer applications</p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-base flex-shrink-0">⚠️</span>
                  <p className="text-amber-300 text-xs">
                    Skipping this step means influencers won&apos;t see any active campaigns from you. You can always post a campaign later from your dashboard.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="/campaigns/post"
                  className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-colors text-center"
                >
                  Post My First Campaign →
                </a>
                <button
                  onClick={() => setDone(true)}
                  className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-[#64748B] py-3 rounded-xl text-sm hover:border-[#2E2E3E] hover:text-[#94A3B8] transition-colors"
                >
                  Skip — Go to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
