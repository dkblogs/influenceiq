"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

const inputClass = "w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] transition-colors"
const readonlyClass = "w-full px-4 py-2.5 bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg text-sm text-[#64748B] cursor-not-allowed"
const selectClass = `${inputClass} text-[#94A3B8]`
const labelClass = "block text-sm font-medium text-[#94A3B8] mb-1.5"

function Spinner() {
  return (
    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  )
}

function HandleVerifier({
  label, placeholder, platform, handle, onHandleChange,
  step, code, error, followers, generating,
  onGenerate, onCheck, onReset,
}: {
  label: string; placeholder: string; platform: string; handle: string
  onHandleChange: (v: string) => void
  step: "idle" | "generated" | "checking" | "verified"
  code: string; error: string; followers: number | null; generating: boolean
  onGenerate: () => void; onCheck: () => void; onReset: () => void
}) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-[#94A3B8]">{label}</span>
        {step === "verified" && (
          <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full">
            ✓ Verified{followers ? ` · ${followers.toLocaleString()} followers` : ""}
          </span>
        )}
        {step !== "verified" && (
          <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full">⚠ Not Verified</span>
        )}
      </div>

      {/* Handle input row */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={handle}
          onChange={e => onHandleChange(e.target.value)}
          className={`${inputClass} flex-1`}
          placeholder={placeholder}
          disabled={step === "verified"}
        />
        {step === "idle" && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating || !handle}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 disabled:opacity-40 transition-colors"
          >
            {generating ? <><Spinner /> Generating...</> : "Start Verification"}
          </button>
        )}
        {(step === "generated" || step === "checking") && (
          <button
            type="button"
            onClick={onReset}
            className="flex-shrink-0 px-3 py-2 bg-[#1E1E2E] text-[#64748B] text-sm rounded-lg hover:text-[#94A3B8] transition-colors border border-[#1E1E2E]"
          >
            Reset
          </button>
        )}
        {step === "verified" && (
          <button
            type="button"
            onClick={onReset}
            className="flex-shrink-0 px-3 py-2 bg-[#1E1E2E] text-[#64748B] text-xs rounded-lg hover:text-[#94A3B8] transition-colors border border-[#1E1E2E]"
          >
            Re-verify
          </button>
        )}
      </div>

      {/* Code box */}
      {(step === "generated" || step === "checking") && code && (
        <div className="mb-3 bg-[#0A0A0F] border border-purple-500/30 rounded-xl p-4">
          <p className="text-xs text-[#64748B] mb-2">
            Add this code to your {platform === "instagram" ? "Instagram" : "YouTube"} bio:
          </p>
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="font-mono text-lg font-bold text-purple-300 tracking-widest">{code}</span>
            <button
              type="button"
              onClick={copy}
              className="text-xs bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <ol className="text-xs text-[#94A3B8] space-y-1 mb-4 list-decimal list-inside">
            {platform === "instagram"
              ? <><li>Open Instagram → Edit Profile → Bio</li><li>Paste the code → Save</li></>
              : <><li>Open YouTube Studio → Customisation → Basic Info → Description</li><li>Paste the code → Publish</li></>
            }
            <li>Come back here and click the button below</li>
          </ol>
          <button
            type="button"
            onClick={onCheck}
            disabled={step === "checking"}
            className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#059669] disabled:opacity-60 transition-colors"
          >
            {step === "checking"
              ? <><Spinner /> Checking your bio via Apify...</>
              : "I've Added It — Verify Now"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any

  const [profile, setProfile] = useState<any>(null)
  const [influencer, setInfluencer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  // Editable fields — shared
  const [name, setName] = useState("")
  // Brand fields
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [phone, setPhone] = useState("")
  const [about, setAbout] = useState("")
  // Influencer fields
  const [niche, setNiche] = useState("")
  const [platform, setPlatform] = useState("")
  const [bio, setBio] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [youtubeHandle, setYoutubeHandle] = useState("")

  // Apify fetch state (auto-fill)
  const [fetchingProfile, setFetchingProfile] = useState(false)
  const [fetchStatus, setFetchStatus] = useState<"" | "success" | "error">("")
  // Per-handle two-step verification state
  type VerifyStep = "idle" | "generated" | "checking" | "verified"
  const [igStep, setIgStep] = useState<VerifyStep>("idle")
  const [igCode, setIgCode] = useState("")
  const [igError, setIgError] = useState("")
  const [igFollowers, setIgFollowers] = useState<number | null>(null)
  const [igGenerating, setIgGenerating] = useState(false)
  const [ytStep, setYtStep] = useState<VerifyStep>("idle")
  const [ytCode, setYtCode] = useState("")
  const [ytError, setYtError] = useState("")
  const [ytFollowers, setYtFollowers] = useState<number | null>(null)
  const [ytGenerating, setYtGenerating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "loading") return
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        setProfile(d.user)
        setInfluencer(d.influencer)
        setName(d.user?.name || "")
        setCompanyName(d.user?.companyName || "")
        setIndustry(d.user?.industry || "")
        setLocation(d.user?.location || "")
        setWebsite(d.user?.website || "")
        setPhone(d.user?.phone || "")
        setAbout(d.user?.about || "")
        if (d.influencer) {
          setNiche(d.influencer.niche || "")
          setPlatform(d.influencer.platform || "")
          setBio(d.influencer.about || "")
          setLocation(d.influencer.location || "")
          setInstagramHandle(d.influencer.instagramHandle || "")
          setYoutubeHandle(d.influencer.youtubeHandle || "")
          setIgFollowers(d.influencer.instagramFollowers ?? null)
          setYtFollowers(d.influencer.youtubeFollowers ?? null)
          if (d.influencer.instagramVerified) {
            setIgStep("verified")
          } else if (d.influencer.instagramVerifyCode) {
            setIgStep("generated")
            setIgCode(d.influencer.instagramVerifyCode)
          }
          if (d.influencer.youtubeVerified) {
            setYtStep("verified")
          } else if (d.influencer.youtubeVerifyCode) {
            setYtStep("generated")
            setYtCode(d.influencer.youtubeVerifyCode)
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [status])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, companyName, industry, location, website, phone, about, niche, platform, bio, instagramHandle, youtubeHandle }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || "Failed to save"); return }
    setProfile(data.user)
    if (data.influencer) setInfluencer(data.influencer)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleGenerateCode(platform: "instagram" | "youtube") {
    const handle = platform === "instagram" ? instagramHandle : youtubeHandle
    if (!handle) return
    if (platform === "instagram") { setIgGenerating(true); setIgError("") }
    else { setYtGenerating(true); setYtError("") }
    try {
      const res = await fetch("/api/verify-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle, step: "generate" }),
      })
      const data = await res.json()
      if (data.code) {
        if (platform === "instagram") { setIgCode(data.code); setIgStep("generated") }
        else { setYtCode(data.code); setYtStep("generated") }
      } else {
        const msg = data.error || "Failed to generate code"
        if (platform === "instagram") setIgError(msg)
        else setYtError(msg)
      }
    } catch {
      const msg = "Failed to generate code — try again"
      if (platform === "instagram") setIgError(msg)
      else setYtError(msg)
    } finally {
      if (platform === "instagram") setIgGenerating(false)
      else setYtGenerating(false)
    }
  }

  async function handleCheckCode(platform: "instagram" | "youtube") {
    const handle = platform === "instagram" ? instagramHandle : youtubeHandle
    if (!handle) return
    if (platform === "instagram") { setIgStep("checking"); setIgError("") }
    else { setYtStep("checking"); setYtError("") }
    try {
      const res = await fetch("/api/verify-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle, step: "check" }),
      })
      const data = await res.json()
      if (data.verified) {
        if (platform === "instagram") {
          setIgStep("verified")
          setIgFollowers(data.followers ?? null)
        } else {
          setYtStep("verified")
          setYtFollowers(data.followers ?? null)
        }
      } else {
        const msg = data.error || "Code not found in bio"
        if (platform === "instagram") { setIgStep("generated"); setIgError(msg) }
        else { setYtStep("generated"); setYtError(msg) }
      }
    } catch {
      const msg = "Verification failed — try again"
      if (platform === "instagram") { setIgStep("generated"); setIgError(msg) }
      else { setYtStep("generated"); setYtError(msg) }
    }
  }

  async function handleFetchProfile() {
    if (!instagramHandle && !youtubeHandle) {
      setError("Enter at least one handle before fetching")
      return
    }
    setFetchingProfile(true)
    setFetchStatus("")
    setError("")
    try {
      const res = await fetch("/api/scrape-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramHandle: instagramHandle || undefined,
          youtubeHandle: youtubeHandle || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFetchStatus("error")
      } else {
        if (data.fullName) setName(data.fullName)
        if (data.bio) setBio(data.bio)
        setFetchStatus("success")
      }
    } catch {
      setFetchStatus("error")
    } finally {
      setFetchingProfile(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  const role = profile?.role
  const isBrand = role === "brand"
  const isInfluencer = role === "influencer"

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 md:px-8 py-10 max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Your Profile</h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {isBrand ? "Manage your brand account settings" : "Manage your influencer profile"}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Account Info */}
          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
            <h2 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wide">Account</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Your name" />
              </div>
              <div>
                <label className={labelClass}>Email address</label>
                <input type="email" value={profile?.email || ""} readOnly className={readonlyClass} />
                <p className="text-xs text-[#64748B] mt-1">Email cannot be changed</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B]">Role:</span>
                <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full capitalize">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Brand-specific: Company Details */}
          {isBrand && (
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              <h2 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wide">Company Details</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Brand / Company Name</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                    className={inputClass} placeholder="Your company or brand name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Industry / Niche</label>
                    <select value={industry} onChange={e => setIndustry(e.target.value)} className={selectClass}>
                      <option value="">Select industry</option>
                      <option>Fashion</option>
                      <option>Beauty</option>
                      <option>Tech</option>
                      <option>Food & Beverage</option>
                      <option>Health & Fitness</option>
                      <option>Travel</option>
                      <option>Education</option>
                      <option>Finance</option>
                      <option>Entertainment</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      className={inputClass} placeholder="City, State" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Website URL</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                      className={inputClass} placeholder="https://yourbrand.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      className={inputClass} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>About / Description</label>
                  <textarea value={about} onChange={e => setAbout(e.target.value)}
                    rows={3} className={`${inputClass} resize-none`}
                    placeholder="Brief description of your brand, what you do, and what kind of influencers you're looking for..." />
                </div>
              </div>
            </div>
          )}

          {/* Brand-specific: Verification section */}
          {isBrand && (
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              <h2 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wide">Brand Verification</h2>
              {profile?.brandVerified ? (
                <div className="flex items-center gap-3 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl">
                  <span className="text-xl">✓</span>
                  <div>
                    <p className="text-sm font-medium text-[#10B981]">Your brand is verified</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Influencers can trust your campaigns</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-amber-400">Not yet verified</p>
                      <p className="text-xs text-[#64748B] mt-0.5">Verification builds trust with influencers</p>
                    </div>
                  </div>
                  <a
                    href="/verify-brand"
                    className="inline-flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Apply for verification →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Influencer-specific fields */}
          {isInfluencer && (
            <>
              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
                <h2 className="font-semibold text-[#F8FAFC] mb-1 text-sm uppercase tracking-wide">Social Handles</h2>
                <p className="text-xs text-[#64748B] mb-6">Verify ownership by adding a unique code to your bio. Verified handles build trust with brands and unlock AI Score.</p>

                {/* ── Instagram ── */}
                <HandleVerifier
                  label="Instagram Handle"
                  placeholder="@instagram_username"
                  platform="instagram"
                  handle={instagramHandle}
                  onHandleChange={v => { setInstagramHandle(v); setIgStep("idle"); setIgCode(""); setIgError("") }}
                  step={igStep}
                  code={igCode}
                  error={igError}
                  followers={igFollowers}
                  generating={igGenerating}
                  onGenerate={() => handleGenerateCode("instagram")}
                  onCheck={() => handleCheckCode("instagram")}
                  onReset={() => { setIgStep("idle"); setIgCode(""); setIgError("") }}
                />

                <div className="my-5 border-t border-[#1E1E2E]" />

                {/* ── YouTube ── */}
                <HandleVerifier
                  label="YouTube Channel"
                  placeholder="@youtube_channel"
                  platform="youtube"
                  handle={youtubeHandle}
                  onHandleChange={v => { setYoutubeHandle(v); setYtStep("idle"); setYtCode(""); setYtError("") }}
                  step={ytStep}
                  code={ytCode}
                  error={ytError}
                  followers={ytFollowers}
                  generating={ytGenerating}
                  onGenerate={() => handleGenerateCode("youtube")}
                  onCheck={() => handleCheckCode("youtube")}
                  onReset={() => { setYtStep("idle"); setYtCode(""); setYtError("") }}
                />
              </div>

              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
                <h2 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wide">Profile Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Primary platform</label>
                      <select value={platform} onChange={e => setPlatform(e.target.value)} className={selectClass}>
                        <option value="">Select platform</option>
                        <option>Instagram</option>
                        <option>YouTube</option>
                        <option>Facebook</option>
                        <option>LinkedIn</option>
                        <option>X (Twitter)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Niche</label>
                      <select value={niche} onChange={e => setNiche(e.target.value)} className={selectClass}>
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
                  <div>
                    <label className={labelClass}>City / Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      className={inputClass} placeholder="Mumbai, Delhi, Bangalore..." />
                  </div>
                  <div>
                    <label className={labelClass}>Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)}
                      rows={3} className={`${inputClass} resize-none`}
                      placeholder="Tell brands about yourself and your content..." />
                  </div>
                </div>
              </div>

              {/* Influencer verification */}
              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
                <h2 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wide">Verification Badge</h2>
                {influencer?.verified ? (
                  <div className="flex items-center gap-3 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl">
                    <span className="text-xl">✓</span>
                    <p className="text-sm font-medium text-[#10B981]">Your profile is verified</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[#94A3B8]">
                      Get a verification badge by connecting your social media data. Brands trust verified influencers more.
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Verification requires your Instagram or YouTube handle to be fetched above.
                    </p>
                    <div className="inline-block text-xs bg-[#1E1E2E] text-[#64748B] px-3 py-2 rounded-lg">
                      Coming soon — verification flow in progress
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg border border-red-500/20">{error}</div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && (
              <span className="text-sm text-[#10B981] flex items-center gap-1.5">
                <span>✓</span> Saved successfully
              </span>
            )}
          </div>

        </form>
      </div>
    </main>
  )
}
