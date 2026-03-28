"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import InsufficientCreditsError from "@/app/components/InsufficientCreditsError"
import { useApp } from "@/app/context/AppContext"
import { NICHES, PLATFORMS, INDUSTRIES } from "@/lib/constants"

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
              ? <><Spinner /> Checking your bio...</>
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
  const { credits } = useApp()
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
  const [phoneCode, setPhoneCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [about, setAbout] = useState("")
  // Influencer fields
  const [niche, setNiche] = useState("")
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [customNiche, setCustomNiche] = useState("")
  const [platform, setPlatform] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [customPlatform, setCustomPlatform] = useState("")
  const [gender, setGender] = useState("")
  const [bio, setBio] = useState("")

  function toggleNiche(n: string) {
    setSelectedNiches(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : prev.length < 5 ? [...prev, n] : prev
    )
  }
  function togglePlatform(p: string) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : prev.length < 4 ? [...prev, p] : prev
    )
  }
  const [instagramHandle, setInstagramHandle] = useState("")
  const [youtubeHandle, setYoutubeHandle] = useState("")

  // Bio Writer modal state
  const [bioModalOpen, setBioModalOpen] = useState(false)
  const [bioModalTone, setBioModalTone] = useState("Professional")
  const [bioModalAchievements, setBioModalAchievements] = useState("")
  const [bioModalLoading, setBioModalLoading] = useState(false)
  const [bioModalResult, setBioModalResult] = useState<any>(null)
  const [bioModalError, setBioModalError] = useState("")
  const [bioCreditError, setBioCreditError] = useState(false)

  // Verification badge state
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState("")
  const [verifySuccess, setVerifySuccess] = useState(false)

  // View / edit mode toggle for influencers
  const [isEditing, setIsEditing] = useState(false)

  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [portfolioLoaded, setPortfolioLoaded] = useState(false)
  const [portfolioToast, setPortfolioToast] = useState("")
  const [portfolioError, setPortfolioError] = useState("")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState({ brandName: "", campaignTitle: "", description: "", deliverables: "", results: "", mediaUrl: "", completedAt: "" })


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
        const rawPhone = (d.influencer?.phone ?? d.user?.phone) || ""
        const knownCodes = ["+880", "+971", "+977", "+94", "+92", "+91", "+65", "+66", "+63", "+62", "+61", "+60", "+55", "+49", "+44", "+33", "+27", "+86", "+81", "+1"]
        const matchedCode = knownCodes.find(c => rawPhone.startsWith(c))
        if (matchedCode) { setPhoneCode(matchedCode); setPhoneNumber(rawPhone.slice(matchedCode.length)) }
        else { setPhoneCode("+91"); setPhoneNumber(rawPhone) }
        setAbout(d.user?.about || "")
        if (d.influencer) {
          setNiche(d.influencer.niche || "")
          setSelectedNiches(d.influencer.niches?.length ? d.influencer.niches : (d.influencer.niche ? [d.influencer.niche] : []))
          setPlatform(d.influencer.platform || "")
          setSelectedPlatforms(d.influencer.platforms?.length ? d.influencer.platforms : (d.influencer.platform ? [d.influencer.platform] : []))
          setGender(d.influencer.gender || "")
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
        if (d.influencer?.id && !portfolioLoaded) {
          fetch(`/api/portfolio?influencerId=${d.influencer.id}`)
            .then(r => r.json())
            .then(pd => { setPortfolioItems(pd.items || []); setPortfolioLoaded(true) })
            .catch(() => {})
        }
      })
      .catch(() => setLoading(false))
  }, [status])

  function showPortfolioToast(msg: string) {
    setPortfolioToast(msg)
    setTimeout(() => setPortfolioToast(""), 3000)
  }

  async function handlePortfolioAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!influencer?.id) { setPortfolioError("No influencer profile found"); return }
    setPortfolioError("")
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...portfolioForm, influencerId: influencer.id }),
    })
    const data = await res.json()
    if (!res.ok) { setPortfolioError(data.error || "Failed to add item"); return }
    setPortfolioItems(prev => [data.item, ...prev])
    setPortfolioForm({ brandName: "", campaignTitle: "", description: "", deliverables: "", results: "", mediaUrl: "", completedAt: "" })
    setShowAddForm(false)
    showPortfolioToast("Collaboration added!")
  }

  async function handlePortfolioDelete(id: string) {
    if (!confirm("Delete this portfolio item?")) return
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" })
    if (res.ok) {
      setPortfolioItems(prev => prev.filter(i => i.id !== id))
      showPortfolioToast("Deleted.")
    }
  }

  async function handlePortfolioEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingItem) return
    const res = await fetch(`/api/portfolio/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingItem),
    })
    const data = await res.json()
    if (!res.ok) { setPortfolioError(data.error || "Failed to update"); return }
    setPortfolioItems(prev => prev.map(i => i.id === data.item.id ? data.item : i))
    setEditingItem(null)
    showPortfolioToast("Updated!")
  }

  async function handleRequestVerification() {
    if (credits !== null && credits < 20) {
      setVerifyError("CREDITS")
      return
    }
    setVerifyLoading(true)
    setVerifyError("")
    const res = await fetch("/api/request-verification", { method: "POST" })
    const data = await res.json()
    setVerifyLoading(false)
    if (!res.ok) {
      setVerifyError(res.status === 402 ? "CREDITS" : (data.error || "Verification failed"))
      return
    }
    if (data.verified) {
      setVerifySuccess(true)
      setInfluencer((prev: any) => ({ ...prev, verified: true }))
    } else if (data.missing) {
      setVerifyError(`Missing requirements: ${data.missing.join(", ")}`)
    }
  }

  async function handleGenerateBio() {
    setBioModalLoading(true)
    setBioModalError("")
    setBioModalResult(null)
    const res = await fetch("/api/bio-writer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, niche, platform, location, achievements: bioModalAchievements, style: bioModalTone }),
    })
    const data = await res.json()
    setBioModalLoading(false)
    if (!res.ok) { setBioModalError(res.status === 402 ? "CREDITS" : (data.error || "Failed to generate bio")); return }
    setBioModalResult(data)
  }

  function closeBioModal() {
    setBioModalOpen(false)
    setBioModalResult(null)
    setBioModalError("")
    setBioModalAchievements("")
    setBioModalTone("Professional")
  }

  function resetFormState() {
    setName(profile?.name || "")
    setLocation(influencer?.location || profile?.location || "")
    setBio(influencer?.about || "")
    setNiche(influencer?.niche || "")
    setSelectedNiches(influencer?.niches?.length ? influencer.niches : (influencer?.niche ? [influencer.niche] : []))
    setPlatform(influencer?.platform || "")
    setSelectedPlatforms(influencer?.platforms?.length ? influencer.platforms : (influencer?.platform ? [influencer.platform] : []))
    setGender(influencer?.gender || "")
    const rawPhone = (influencer?.phone ?? profile?.phone) || ""
    const knownCodes = ["+880", "+971", "+977", "+94", "+92", "+91", "+65", "+66", "+63", "+62", "+61", "+60", "+55", "+49", "+44", "+33", "+27", "+86", "+81", "+1"]
    const matchedCode = knownCodes.find(c => rawPhone.startsWith(c))
    if (matchedCode) { setPhoneCode(matchedCode); setPhoneNumber(rawPhone.slice(matchedCode.length)) }
    else { setPhoneCode("+91"); setPhoneNumber(rawPhone) }
  }

  function handleCancel() {
    resetFormState()
    setIsEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, companyName, industry, location, website,
        phone: phoneCode + phoneNumber, about, gender, bio, instagramHandle, youtubeHandle,
        niches: selectedNiches.map(n => n === "Other" ? (customNiche.trim() || "Other") : n),
        platforms: selectedPlatforms.map(p => p === "Other" ? (customPlatform.trim() || "Other") : p),
        niche: selectedNiches[0] === "Other" ? (customNiche.trim() || "Other") : (selectedNiches[0] || niche),
        platform: selectedPlatforms[0] === "Other" ? (customPlatform.trim() || "Other") : (selectedPlatforms[0] || platform),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || "Failed to save"); return }
    setProfile(data.user)
    if (data.influencer) setInfluencer(data.influencer)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    if (data.influencer) setIsEditing(false)
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

  // Derived display values (used in both view and edit mode)
  const initials = name
    ? name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"
  const displayPhone = phoneNumber ? `${phoneCode} ${phoneNumber}` : "Not provided"
  const hasVerifiedHandleView = igStep === "verified" || ytStep === "verified"
  const completenessFields = [
    { label: "Bio", done: !!bio?.trim(), weight: 10, fieldId: "bio-field" },
    { label: "Location", done: !!location?.trim(), weight: 10, fieldId: "location-field" },
    { label: "Phone number", done: !!phoneNumber?.trim(), weight: 15, fieldId: "phone-field" },
    { label: "Social handle verified", done: hasVerifiedHandleView, weight: 25, href: "#social-handles" },
    { label: "AI Score & Report", done: !!influencer?.aiReportGeneratedAt, weight: 25, href: "/dashboard" },
    { label: "Portfolio item", done: portfolioItems.length > 0, weight: 15, href: "#portfolio-section" },
  ]
  const completenessScore = completenessFields.reduce((acc, f) => acc + (f.done ? f.weight : 0), 0)
  const incompleteFields = completenessFields.filter(f => !f.done)
  const scrollFocus = (id: string) => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus() } }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 md:px-8 py-10 max-w-2xl mx-auto">

        {/* ── Influencer: VIEW mode ── */}
        {isInfluencer && !isEditing && (
          <div className="space-y-5">
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              {/* Avatar + name */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white mb-3">
                  {initials}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <h2 className="text-xl font-bold text-[#F8FAFC]">{name || "—"}</h2>
                  {(influencer?.verified || verifySuccess) && (
                    <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-1 rounded-full border border-cyan-500/20 font-semibold">✓ Verified</span>
                  )}
                </div>
                <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full mt-1.5 capitalize">Influencer</span>
                <p className="text-sm text-[#64748B] mt-1">{profile?.email}</p>
              </div>

              {/* Niche / platform / AI score tags */}
              <div className="flex flex-wrap gap-2 justify-center mb-5">
                {(influencer?.niches?.length ? influencer.niches : (niche ? [niche] : [])).map((n: string) => (
                  <span key={n} className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-3 py-1 rounded-full border border-[#2A2A3A]">{n}</span>
                ))}
                {(influencer?.platforms?.length ? influencer.platforms : (platform ? [platform] : [])).map((p: string) => (
                  <span key={p} className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">{p}</span>
                ))}
                {gender && <span className="text-xs bg-[#1E1E2E] text-[#64748B] px-3 py-1 rounded-full border border-[#2A2A3A]">{gender}</span>}
                {influencer?.aiScore != null && (
                  <span className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 font-semibold">
                    AI Score: {influencer.aiScore}/100
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm mb-5">
                {location && (
                  <div className="flex gap-3">
                    <span className="text-[#64748B] w-20 shrink-0">Location</span>
                    <span className="text-[#F8FAFC]">{location}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <span className="text-[#64748B] w-20 shrink-0">Phone</span>
                  <span className="text-[#F8FAFC] font-mono tracking-wide">{displayPhone}</span>
                </div>
                {bio && (
                  <div className="flex gap-3">
                    <span className="text-[#64748B] w-20 shrink-0 pt-0.5">Bio</span>
                    <p className="text-[#94A3B8] leading-relaxed flex-1">{bio}</p>
                  </div>
                )}
              </div>

              {/* Social handles */}
              <div className="border-t border-[#1E1E2E] pt-4 mb-5">
                <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-3">Social Handles</h3>
                <div className="space-y-2">
                  {instagramHandle ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#94A3B8] w-24 shrink-0">Instagram</span>
                      {igStep === "verified" ? (
                        <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2.5 py-1 rounded-full">
                          ✓ Verified{igFollowers ? ` · ${igFollowers.toLocaleString()} followers` : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">⚠ Not Verified</span>
                      )}
                    </div>
                  ) : null}
                  {youtubeHandle ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#94A3B8] w-24 shrink-0">YouTube</span>
                      {ytStep === "verified" ? (
                        <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2.5 py-1 rounded-full">
                          ✓ Verified{ytFollowers ? ` · ${ytFollowers.toLocaleString()} subscribers` : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">⚠ Not Verified</span>
                      )}
                    </div>
                  ) : null}
                  {!instagramHandle && !youtubeHandle && (
                    <p className="text-sm text-[#64748B]">No social handles added yet</p>
                  )}
                </div>
              </div>

              {/* Portfolio preview */}
              <div className="border-t border-[#1E1E2E] pt-4 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Portfolio</h3>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(true); setTimeout(() => { const el = document.getElementById("portfolio-section"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }) }, 100) }}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Edit Portfolio →
                  </button>
                </div>
                {portfolioItems.length === 0 ? (
                  <div className="text-center py-5 text-[#64748B]">
                    <div className="text-2xl mb-2">📂</div>
                    <p className="text-sm mb-3">No portfolio items yet</p>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(true); setShowAddForm(true); setTimeout(() => { const el = document.getElementById("portfolio-section"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }) }, 100) }}
                      className="text-xs bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-600/30 transition-colors"
                    >
                      Add your first collaboration →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {portfolioItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-start gap-3 p-3 border border-[#1E1E2E] rounded-xl">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-purple-400 font-medium">{item.brandName}</div>
                          <div className="text-sm font-medium text-[#F8FAFC] truncate">{item.campaignTitle}</div>
                          {item.results && <div className="text-xs text-[#10B981] mt-0.5 truncate">{item.results}</div>}
                          {item.description && <div className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{item.description}</div>}
                          {item.completedAt && (
                            <div className="text-xs text-[#64748B] mt-0.5">
                              {new Date(item.completedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {portfolioItems.length > 3 && (
                      <p className="text-xs text-[#64748B] text-center pt-1">+{portfolioItems.length - 3} more</p>
                    )}
                  </div>
                )}
              </div>

              {/* Completeness */}
              <div className="border-t border-[#1E1E2E] pt-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F8FAFC]">Profile completeness</span>
                  <span className={`text-sm font-bold ${completenessScore === 100 ? "text-[#10B981]" : completenessScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{completenessScore}%</span>
                </div>
                <div className="w-full bg-[#1E1E2E] rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${completenessScore === 100 ? "bg-[#10B981]" : completenessScore >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                    style={{ width: `${completenessScore}%` }}
                  />
                </div>
                {incompleteFields.length > 0 && (
                  <div className="space-y-1.5">
                    {incompleteFields.map(f => (
                      <div key={f.label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-[#64748B]">
                          <span className="text-red-400 text-xs">✕</span> {f.label}
                          <span className="text-xs text-[#334155]">+{f.weight}%</span>
                        </span>
                        <button type="button" onClick={() => setIsEditing(true)} className="text-xs text-purple-400 hover:text-purple-300 hover:underline">Add now →</button>
                      </div>
                    ))}
                  </div>
                )}
                {completenessScore === 100 && (
                  <div className="flex items-center gap-2 text-sm text-[#10B981]"><span>✓</span> Profile is complete</div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
              >
                Edit Profile
              </button>
              {influencer?.id && (
                <a
                  href={`/influencer/${influencer.id}`}
                  className="w-full block text-center border border-[#334155] text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                >
                  View My Public Profile →
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Influencer: EDIT mode ── */}
        {isInfluencer && isEditing && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 rounded-lg bg-[#1E1E2E] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#2A2A3A] transition-colors text-lg leading-none"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#F8FAFC]">Edit Profile</h1>
                <p className="text-xs text-[#64748B]">Changes are saved to your public profile</p>
              </div>
            </div>

            {/* Completeness indicator */}
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[#F8FAFC]">Profile completeness</span>
                <span className={`text-sm font-bold ${completenessScore === 100 ? "text-[#10B981]" : completenessScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{completenessScore}%</span>
              </div>
              <div className="w-full bg-[#1E1E2E] rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${completenessScore === 100 ? "bg-[#10B981]" : completenessScore >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                  style={{ width: `${completenessScore}%` }}
                />
              </div>
              {!phoneNumber?.trim() && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
                  <span className="text-red-400 flex-shrink-0 mt-0.5">⚠️</span>
                  <p className="text-sm text-red-400">
                    Brands can't contact you without a phone number.{" "}
                    <button type="button" onClick={() => scrollFocus("phone-field")} className="underline hover:text-red-300 font-medium">Add it now.</button>
                  </p>
                </div>
              )}
              {incompleteFields.length > 0 && (
                <div className="space-y-1.5">
                  {incompleteFields.map(f => (
                    <div key={f.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-[#64748B]">
                        <span className="text-red-400 text-xs">✕</span> {f.label}
                        <span className="text-xs text-[#334155]">+{f.weight}%</span>
                      </span>
                      {(f as any).fieldId ? (
                        <button type="button" onClick={() => scrollFocus((f as any).fieldId)} className="text-xs text-purple-400 hover:text-purple-300 hover:underline">Add now →</button>
                      ) : f.href ? (
                        <a href={f.href} className="text-xs text-purple-400 hover:text-purple-300 hover:underline">Add now →</a>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              {completenessScore === 100 && (
                <div className="flex items-center gap-2 text-sm text-[#10B981]"><span>✓</span> Profile is complete</div>
              )}
            </div>

            {/* Account */}
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
              </div>
            </div>

            {/* Social Handles */}
            <div id="social-handles" className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              <h2 className="font-semibold text-[#F8FAFC] mb-1 text-sm uppercase tracking-wide">Social Handles</h2>
              <p className="text-xs text-[#64748B] mb-6">Verify ownership by adding a unique code to your bio. Verified handles build trust with brands and unlock AI Score.</p>
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

            {/* Profile Details */}
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              <h2 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wide">Profile Details</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Platforms <span className="text-[#64748B] font-normal">(select up to 4)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(p => (
                      <button key={p} type="button" onClick={() => togglePlatform(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedPlatforms.includes(p) ? "bg-purple-600 text-white border-purple-600" : "bg-[#0A0A0F] text-[#94A3B8] border-[#1E1E2E] hover:border-purple-500/50"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  {selectedPlatforms.includes("Other") && (
                    <input type="text" value={customPlatform} onChange={e => setCustomPlatform(e.target.value)}
                      placeholder="Enter your platform..." className={`${inputClass} mt-2`} />
                  )}
                  <p className="text-[#64748B] text-xs mt-1">{selectedPlatforms.length}/4 selected</p>
                </div>
                <div>
                  <label className={labelClass}>Niches <span className="text-[#64748B] font-normal">(select up to 5)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {NICHES.map(n => (
                      <button key={n} type="button" onClick={() => toggleNiche(n)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedNiches.includes(n) ? "bg-purple-600 text-white border-purple-600" : "bg-[#0A0A0F] text-[#94A3B8] border-[#1E1E2E] hover:border-purple-500/50"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                  {selectedNiches.includes("Other") && (
                    <input type="text" value={customNiche} onChange={e => setCustomNiche(e.target.value)}
                      placeholder="Enter your niche..." className={`${inputClass} mt-2`} />
                  )}
                  <p className="text-[#64748B] text-xs mt-1">{selectedNiches.length}/5 selected</p>
                </div>
                <div>
                  <label className={labelClass}>Gender <span className="text-[#64748B] font-normal">(optional)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {["Male", "Female", "Non-binary", "Prefer not to say"].map(g => (
                      <button key={g} type="button" onClick={() => setGender(gender === g ? "" : g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${gender === g ? "bg-purple-600 text-white border-purple-600" : "bg-[#0A0A0F] text-[#94A3B8] border-[#1E1E2E] hover:border-purple-500/50"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>City / Location</label>
                  <input id="location-field" type="text" value={location} onChange={e => setLocation(e.target.value)}
                    className={inputClass} placeholder="Mumbai, Delhi, Bangalore..." />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="flex gap-2">
                    <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-[#F8FAFC] text-sm w-32 shrink-0 focus:outline-none focus:border-purple-500">
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+62">🇮🇩 +62</option>
                      <option value="+63">🇵🇭 +63</option>
                      <option value="+66">🇹🇭 +66</option>
                      <option value="+880">🇧🇩 +880</option>
                      <option value="+92">🇵🇰 +92</option>
                      <option value="+94">🇱🇰 +94</option>
                      <option value="+977">🇳🇵 +977</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+86">🇨🇳 +86</option>
                    </select>
                    <input id="phone-field" type="tel" inputMode="numeric" maxLength={10} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-[#F8FAFC] text-sm focus:outline-none focus:border-purple-500 placeholder-[#64748B]" />
                  </div>
                </div>
                <div id="bio">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelClass.replace("mb-1.5", "mb-0")}>Bio</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (credits !== null && credits < 1) { setBioCreditError(true); return }
                        setBioCreditError(false)
                        setBioModalOpen(true)
                      }}
                      className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg hover:bg-purple-500/20 transition-colors"
                    >
                      ✨ Generate with AI
                    </button>
                  </div>
                  {bioCreditError && (
                    <p className="text-xs text-red-400 mt-1">
                      Needs 1 credit. You have {credits}.{" "}
                      <a href="/pricing?from=/profile" className="text-purple-400 underline hover:text-purple-300">Buy credits →</a>
                    </p>
                  )}
                  <textarea id="bio-field" value={bio} onChange={e => setBio(e.target.value)}
                    rows={3} className={`${inputClass} resize-none`}
                    placeholder="Tell brands about yourself and your content..." />
                </div>
              </div>
            </div>

            {/* InfluenceIQ Verified Badge */}
            {(() => {
              const hasVerifiedHandle = igStep === "verified" || ytStep === "verified"
              const hasAiReport = !!(influencer?.aiReportGeneratedAt)
              const allConditionsMet = hasVerifiedHandle && hasAiReport
              const isVerified = influencer?.verified || verifySuccess
              return (
                <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 relative overflow-hidden">
                  <h2 className="font-semibold text-[#F8FAFC] mb-4 text-sm uppercase tracking-wide">InfluenceIQ Verified Badge</h2>
                  {isVerified ? (
                    <div className="relative">
                      {verifySuccess && (
                        <style>{`
                          @keyframes confettiFall {
                            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                            100% { transform: translateY(180px) rotate(720deg); opacity: 0; }
                          }
                        `}</style>
                      )}
                      {verifySuccess && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          {["#7C3AED","#06B6D4","#10B981","#F59E0B","#EF4444","#EC4899","#8B5CF6","#14B8A6","#F97316","#3B82F6","#7C3AED","#06B6D4","#10B981","#F59E0B","#EF4444","#EC4899"].map((color, i) => (
                            <div key={i} style={{
                              position: "absolute", top: "-10px",
                              left: `${(i / 16) * 100}%`,
                              width: i % 2 === 0 ? "8px" : "6px",
                              height: i % 2 === 0 ? "8px" : "10px",
                              borderRadius: i % 3 === 0 ? "50%" : "2px",
                              backgroundColor: color,
                              animation: `confettiFall ${0.7 + (i % 5) * 0.15}s ${i * 0.04}s ease-in forwards`,
                            }} />
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gradient-to-r from-[#10B981]/10 to-cyan-500/10 border border-[#10B981]/30 rounded-xl">
                        <div className="text-3xl">✅</div>
                        <div className="flex-1">
                          <p className="text-base font-bold text-[#10B981] mb-0.5">Verified by InfluenceIQ</p>
                          <p className="text-xs text-[#64748B]">Your profile shows a verified tick to all brands</p>
                        </div>
                        <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1.5 rounded-full font-semibold border border-cyan-500/20 flex-shrink-0">
                          ✓ InfluenceIQ Verified
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-[#94A3B8]">
                        Complete the checklist below to earn your InfluenceIQ verified badge. Costs{" "}
                        <strong className="text-[#F8FAFC]">20 credits</strong> — brands trust verified influencers more.
                      </p>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${hasVerifiedHandle ? "bg-[#10B981]/5 border-[#10B981]/20" : "bg-red-500/5 border-red-500/20"}`}>
                          <span>{hasVerifiedHandle ? "✅" : "❌"}</span>
                          <span className="text-sm text-[#94A3B8] flex-1">At least one social handle verified</span>
                          {!hasVerifiedHandle && <span className="text-xs text-purple-400 flex-shrink-0">↑ Verify above</span>}
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${hasAiReport ? "bg-[#10B981]/5 border-[#10B981]/20" : "bg-red-500/5 border-red-500/20"}`}>
                          <span>{hasAiReport ? "✅" : "❌"}</span>
                          <span className="text-sm text-[#94A3B8] flex-1">AI Score & Report generated</span>
                          {!hasAiReport && <a href="/dashboard" className="text-xs text-purple-400 hover:underline flex-shrink-0">Generate →</a>}
                        </div>
                      </div>
                      {verifyError && (
                        <div className="bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                          {verifyError === "CREDITS"
                            ? <InsufficientCreditsError action="get verified" required={20} current={credits} from="/profile" />
                            : <span className="text-sm text-red-400">{verifyError}</span>}
                        </div>
                      )}
                      {allConditionsMet ? (
                        <button
                          type="button"
                          onClick={handleRequestVerification}
                          disabled={verifyLoading}
                          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                        >
                          {verifyLoading ? (
                            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Requesting verification...</>
                          ) : "Request Verification Badge — 20 credits"}
                        </button>
                      ) : (
                        <div className="text-xs text-[#64748B] bg-[#0D0D1A] px-4 py-3 rounded-lg border border-[#1E1E2E]">
                          Complete the requirements above to unlock verification.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Portfolio editor */}
            <div id="portfolio-section" className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-[#F8FAFC] text-sm uppercase tracking-wide">My Portfolio</h2>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(v => !v); setPortfolioError("") }}
                  className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-500 transition-colors"
                >
                  {showAddForm ? "Cancel" : "+ Add Collaboration"}
                </button>
              </div>
              <p className="text-xs text-[#64748B] mb-4">Showcase your past brand collaborations to attract more opportunities.</p>

              {portfolioToast && (
                <div className="bg-[#10B981]/10 text-[#10B981] text-sm px-4 py-3 rounded-lg mb-4 border border-[#10B981]/20">{portfolioToast}</div>
              )}
              {portfolioError && (
                <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg mb-4 border border-red-500/20">{portfolioError}</div>
              )}

              {showAddForm && (
                <form onSubmit={handlePortfolioAdd} className="bg-[#0D0D1A] border border-[#1E1E2E] rounded-xl p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">Brand Name *</label>
                      <input required value={portfolioForm.brandName} onChange={e => setPortfolioForm(p => ({...p, brandName: e.target.value}))}
                        placeholder="e.g. Nike, Zomato" className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">Campaign Title *</label>
                      <input required value={portfolioForm.campaignTitle} onChange={e => setPortfolioForm(p => ({...p, campaignTitle: e.target.value}))}
                        placeholder="e.g. Diwali Product Launch" className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Description</label>
                    <textarea value={portfolioForm.description} onChange={e => setPortfolioForm(p => ({...p, description: e.target.value}))}
                      placeholder="What was the campaign about?" rows={2} className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 resize-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">Deliverables</label>
                      <input value={portfolioForm.deliverables} onChange={e => setPortfolioForm(p => ({...p, deliverables: e.target.value}))}
                        placeholder="e.g. 3 Reels, 5 Stories" className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">Results</label>
                      <input value={portfolioForm.results} onChange={e => setPortfolioForm(p => ({...p, results: e.target.value}))}
                        placeholder="e.g. 2M reach, 8% engagement" className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">Media URL</label>
                      <input type="url" value={portfolioForm.mediaUrl} onChange={e => setPortfolioForm(p => ({...p, mediaUrl: e.target.value}))}
                        placeholder="https://instagram.com/p/..." className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">Completion Date</label>
                      <input type="date" value={portfolioForm.completedAt} onChange={e => setPortfolioForm(p => ({...p, completedAt: e.target.value}))}
                        className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-[#64748B] hover:text-[#94A3B8] px-3 py-1.5 transition-colors">Cancel</button>
                    <button type="submit" className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-500 transition-colors">Save Collaboration</button>
                  </div>
                </form>
              )}

              {portfolioItems.length === 0 && !showAddForm ? (
                <div className="text-center py-8 text-[#64748B]">
                  <div className="text-3xl mb-2">📂</div>
                  <div className="text-sm">No portfolio items yet. Add your first collaboration above.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolioItems.map(item => (
                    <div key={item.id}>
                      {editingItem?.id === item.id ? (
                        <form onSubmit={handlePortfolioEdit} className="bg-[#0D0D1A] border border-purple-500/30 rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-[#94A3B8] mb-1">Brand Name *</label>
                              <input required value={editingItem.brandName} onChange={e => setEditingItem((p: any) => ({...p, brandName: e.target.value}))}
                                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#94A3B8] mb-1">Campaign Title *</label>
                              <input required value={editingItem.campaignTitle} onChange={e => setEditingItem((p: any) => ({...p, campaignTitle: e.target.value}))}
                                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#94A3B8] mb-1">Description</label>
                            <textarea value={editingItem.description || ""} onChange={e => setEditingItem((p: any) => ({...p, description: e.target.value}))}
                              rows={2} className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500 resize-none" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-[#94A3B8] mb-1">Deliverables</label>
                              <input value={editingItem.deliverables || ""} onChange={e => setEditingItem((p: any) => ({...p, deliverables: e.target.value}))}
                                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#94A3B8] mb-1">Results</label>
                              <input value={editingItem.results || ""} onChange={e => setEditingItem((p: any) => ({...p, results: e.target.value}))}
                                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-[#94A3B8] mb-1">Media URL</label>
                              <input type="url" value={editingItem.mediaUrl || ""} onChange={e => setEditingItem((p: any) => ({...p, mediaUrl: e.target.value}))}
                                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#94A3B8] mb-1">Completion Date</label>
                              <input type="date" value={editingItem.completedAt ? new Date(editingItem.completedAt).toISOString().split("T")[0] : ""}
                                onChange={e => setEditingItem((p: any) => ({...p, completedAt: e.target.value}))}
                                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={() => setEditingItem(null)} className="text-sm text-[#64748B] hover:text-[#94A3B8] px-3 py-1.5 transition-colors">Cancel</button>
                            <button type="submit" className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-500 transition-colors">Save Changes</button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between gap-3 p-3 border border-[#1E1E2E] rounded-xl hover:border-purple-500/30 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-purple-400 font-medium">{item.brandName}</div>
                            <div className="text-sm font-medium text-[#F8FAFC] truncate">{item.campaignTitle}</div>
                            {item.results && <div className="text-xs text-[#10B981] mt-0.5 truncate">{item.results}</div>}
                            {item.completedAt && (
                              <div className="text-xs text-[#64748B] mt-0.5">
                                {new Date(item.completedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button type="button" onClick={() => { setEditingItem({...item}); setPortfolioError("") }}
                              className="text-xs border border-[#1E1E2E] text-[#94A3B8] px-2.5 py-1 rounded-lg hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors">
                              Edit
                            </button>
                            <button type="button" onClick={() => handlePortfolioDelete(item.id)}
                              className="text-xs border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {influencer && (
                <div className="mt-4 pt-4 border-t border-[#1E1E2E]">
                  <a href={`/portfolio/${influencer.id}`} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                    View public portfolio page →
                  </a>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg border border-red-500/20">{error}</div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[#1E1E2E] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#2A2A3A] transition-colors border border-[#1E1E2E]"
              >
                Cancel
              </button>
              {saved && (
                <span className="text-sm text-[#10B981] flex items-center gap-1.5"><span>✓</span> Saved</span>
              )}
            </div>
          </form>
        )}

        {/* ── Brand form ── */}
        {isBrand && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Your Profile</h1>
              <p className="text-[#94A3B8] text-sm mt-1">Manage your brand account settings</p>
            </div>
            <form onSubmit={handleSave} className="space-y-6">

              {/* Account */}
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
                    <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full capitalize">{role}</span>
                  </div>
                </div>
              </div>

              {/* Company Details */}
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
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
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
                      <div className="flex gap-2">
                        <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-[#F8FAFC] text-sm w-32 shrink-0 focus:outline-none focus:border-purple-500">
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+60">🇲🇾 +60</option>
                          <option value="+62">🇮🇩 +62</option>
                          <option value="+63">🇵🇭 +63</option>
                          <option value="+66">🇹🇭 +66</option>
                          <option value="+880">🇧🇩 +880</option>
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+94">🇱🇰 +94</option>
                          <option value="+977">🇳🇵 +977</option>
                          <option value="+27">🇿🇦 +27</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+86">🇨🇳 +86</option>
                        </select>
                        <input id="phone-field" type="tel" inputMode="numeric" maxLength={10} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-[#F8FAFC] text-sm focus:outline-none focus:border-purple-500 placeholder-[#64748B]" />
                      </div>
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

              {/* Brand Verification */}
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
                    <a href="/verify-brand" className="inline-flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-500 transition-colors">
                      Apply for verification →
                    </a>
                  </div>
                )}
              </div>

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
                  <span className="text-sm text-[#10B981] flex items-center gap-1.5"><span>✓</span> Saved successfully</span>
                )}
              </div>

            </form>
          </>
        )}

      </div>

      {/* Bio Writer Modal */}
      {bioModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeBioModal}>
          <div
            className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-[#F8FAFC]">✨ AI Bio Writer</h3>
                <button onClick={closeBioModal} className="text-[#64748B] hover:text-[#F8FAFC] text-2xl leading-none transition-colors">×</button>
              </div>
              <p className="text-xs text-[#64748B] mb-5">Tell us about yourself and we&apos;ll write a professional bio for your profile. <span className="text-purple-400">Costs 1 credit.</span></p>

              {!bioModalResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Niches</label>
                      <div className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#64748B]">{selectedNiches.join(", ") || niche || "—"}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Platforms</label>
                      <div className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#64748B]">{selectedPlatforms.join(", ") || platform || "—"}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1.5">Tone</label>
                    <div className="flex gap-2 flex-wrap">
                      {["Professional", "Friendly", "Bold", "Creative"].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBioModalTone(t)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${bioModalTone === t ? "bg-purple-600 text-white" : "bg-[#0A0A0F] border border-[#1E1E2E] text-[#94A3B8] hover:border-purple-500/50"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Key achievements or highlights <span className="text-[#64748B]">(optional)</span></label>
                    <textarea
                      value={bioModalAchievements}
                      onChange={e => setBioModalAchievements(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="e.g. 50K followers, 6% engagement, collab with Nike, viral reel with 1M views..."
                    />
                  </div>

                  {bioModalError && (
                    <div className="bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                      {bioModalError === "CREDITS"
                        ? <InsufficientCreditsError action="generate a bio" required={1} current={credits} from="/profile" />
                        : <span className="text-xs text-red-400">{bioModalError}</span>}
                    </div>
                  )}

                  <button
                    onClick={handleGenerateBio}
                    disabled={bioModalLoading}
                    className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {bioModalLoading ? (
                      <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Writing your bio...</>
                    ) : "Generate Bio →"}
                  </button>
                  <p className="text-center text-xs text-[#64748B]">Costs 1 credit</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#0D0D1A] border border-[#1E1E2E] rounded-xl p-4">
                    <div className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-2">Generated Bio</div>
                    <p className="text-sm text-[#F8FAFC] leading-relaxed whitespace-pre-wrap">{bioModalResult.medium}</p>
                  </div>

                  {bioModalResult.short && (
                    <div className="bg-[#0D0D1A] border border-[#1E1E2E] rounded-xl p-4">
                      <div className="text-xs text-[#64748B] mb-1">Short version <span className="text-[#94A3B8]">(for Instagram bio field)</span></div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">{bioModalResult.short}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setBio(bioModalResult.medium); closeBioModal() }}
                      className="w-full bg-[#10B981] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0ea57a] transition-colors"
                    >
                      Use This Bio
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(bioModalResult.medium)}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-[#94A3B8] py-2.5 rounded-lg text-sm hover:border-purple-500/30 hover:text-[#F8FAFC] transition-colors"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={() => { setBioModalResult(null); setBioModalError("") }}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-[#94A3B8] py-2.5 rounded-lg text-sm hover:border-purple-500/30 hover:text-[#F8FAFC] transition-colors"
                    >
                      Regenerate
                    </button>
                    <button onClick={closeBioModal} className="text-xs text-[#64748B] hover:text-[#F8FAFC] transition-colors py-1">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
