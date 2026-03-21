"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const STEPS = ["Account", "Creator Details", "Verify Handle", "First Action"]

const NICHES = ["Fashion", "Beauty", "Food", "Travel", "Tech", "Finance", "Fitness", "Gaming", "Education", "Other"]
const PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "Twitter/X", "Other"]

export default function InfluencerOnboarding() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any

  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Creator details
  const [niche, setNiche] = useState("")
  const [platform, setPlatform] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && user?.role !== "influencer") router.push("/dashboard")
  }, [status, user, router])

  if (status === "loading" || status !== "authenticated") {
    return <div className="min-h-screen bg-[#0A0A0F]" />
  }

  async function saveCreatorDetails() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, platform, about: bio, location, phone }),
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
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-3">You&apos;re all set!</h1>
          <p className="text-[#94A3B8] text-sm mb-10">Your creator profile is live. What would you like to do first?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <a
              href="/campaigns"
              className="bg-cyan-600 text-white rounded-xl p-6 hover:bg-cyan-500 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📢</div>
              <div className="font-semibold text-[#F8FAFC] mb-1">Apply to a Campaign</div>
              <div className="text-xs text-cyan-200">Browse open brand campaigns</div>
            </a>
            <a
              href="/discover/brands"
              className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-6 hover:border-cyan-500/40 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-semibold text-[#F8FAFC] mb-1">Browse Brand Proposals</div>
              <div className="text-xs text-[#64748B]">Discover brands looking for creators</div>
            </a>
          </div>
          <a href="/dashboard" className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">
            Complete profile later → Go to Dashboard
          </a>
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
              <div key={s} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i + 1 < step ? "bg-[#10B981] text-white" :
                  i + 1 === step ? "bg-cyan-600 text-white" :
                  "bg-[#1E1E2E] text-[#64748B]"
                }`}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] hidden sm:block ml-1 ${i + 1 <= step ? "text-[#94A3B8]" : "text-[#64748B]"}`}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px mx-1 ${i + 1 < step ? "bg-[#10B981]" : "bg-[#1E1E2E]"}`} style={{ width: "24px" }} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-[#1E1E2E] rounded-full">
            <div
              className="h-full bg-cyan-600 rounded-full transition-all duration-500"
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
                  <div className="text-sm text-cyan-400 font-medium">Creator / Influencer</div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-cyan-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-cyan-500 transition-colors"
              >
                Continue → Add Creator Details
              </button>
            </div>
          )}

          {/* Step 2 — Creator Details */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] mb-1">Creator Details</h2>
              <p className="text-[#64748B] text-xs mb-5">Help brands discover you by completing your creator profile</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
              )}

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Your Niche</label>
                    <select value={niche} onChange={e => setNiche(e.target.value)} className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] focus:outline-none focus:border-cyan-500">
                      <option value="">Select niche</option>
                      {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Primary Platform</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] focus:outline-none focus:border-cyan-500">
                      <option value="">Select platform</option>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Location</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Delhi, India" className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Phone</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell brands about yourself..." className="w-full px-3 py-2.5 border border-[#1E1E2E] rounded-lg text-sm bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-cyan-500 resize-none" />
                </div>
              </div>

              <button
                onClick={saveCreatorDetails}
                disabled={saving}
                className="w-full bg-cyan-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save & Continue →"}
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-full mt-2 text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors py-2 flex items-center justify-center gap-1"
              >
                Skip for now ⚠️
                <span className="text-amber-400 text-[10px] ml-1">(incomplete profiles get 80% fewer brand views)</span>
              </button>
            </div>
          )}

          {/* Step 3 — Verify Handle */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] mb-1">Verify Your Handle</h2>
              <p className="text-[#64748B] text-xs mb-4">Verified creators appear first in brand searches</p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-base flex-shrink-0">⚠️</span>
                  <p className="text-amber-300 text-xs">
                    Unverified profiles get <strong>80% fewer brand views</strong>. Verifying your handle takes under 2 minutes and unlocks your full profile.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <a
                  href="/profile"
                  className="w-full bg-cyan-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-cyan-500 transition-colors text-center"
                >
                  Verify My Handle Now →
                </a>
                <button
                  onClick={() => setStep(4)}
                  className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-[#64748B] py-3 rounded-xl text-sm hover:border-[#2E2E3E] hover:text-[#94A3B8] transition-colors"
                >
                  Skip for now ⚠️
                </button>
              </div>
              <p className="text-[10px] text-[#64748B] text-center">You can verify from your Profile page at any time</p>
            </div>
          )}

          {/* Step 4 — First Action */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] mb-1">You&apos;re Almost There!</h2>
              <p className="text-[#64748B] text-xs mb-6">Choose what you&apos;d like to do first on InfluenceIQ</p>

              <div className="flex flex-col gap-3">
                <a
                  href="/campaigns"
                  className="bg-cyan-600/10 border border-cyan-500/30 text-cyan-300 rounded-xl p-4 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
                >
                  📢 Apply to a Campaign →
                </a>
                <a
                  href="/discover/brands"
                  className="bg-[#0A0A0F] border border-[#1E1E2E] text-[#94A3B8] rounded-xl p-4 hover:border-[#2E2E3E] transition-colors text-sm font-medium"
                >
                  🏢 Browse Brand Proposals →
                </a>
                <button
                  onClick={() => setDone(true)}
                  className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors py-2"
                >
                  Complete profile later → Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
