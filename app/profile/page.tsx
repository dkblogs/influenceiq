"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

const inputClass = "w-full px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#0A0A0F] text-[#F8FAFC] placeholder-[#64748B] transition-colors"
const readonlyClass = "w-full px-4 py-2.5 bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg text-sm text-[#64748B] cursor-not-allowed"
const selectClass = `${inputClass} text-[#94A3B8]`
const labelClass = "block text-sm font-medium text-[#94A3B8] mb-1.5"

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

  // Editable fields
  const [name, setName] = useState("")
  const [niche, setNiche] = useState("")
  const [platform, setPlatform] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [youtubeHandle, setYoutubeHandle] = useState("")

  // Apify fetch state
  const [fetchingProfile, setFetchingProfile] = useState(false)
  const [fetchStatus, setFetchStatus] = useState<"" | "success" | "error">("")

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "loading") return
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        setProfile(d.user)
        setInfluencer(d.influencer)
        setName(d.user?.name || "")
        if (d.influencer) {
          setNiche(d.influencer.niche || "")
          setPlatform(d.influencer.platform || "")
          setBio(d.influencer.about || "")
          setLocation(d.influencer.location || "")
          setInstagramHandle(d.influencer.instagramHandle || "")
          setYoutubeHandle(d.influencer.youtubeHandle || "")
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
      body: JSON.stringify({ name, niche, platform, bio, location, instagramHandle, youtubeHandle }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || "Failed to save"); return }
    setProfile(data.user)
    if (data.influencer) setInfluencer(data.influencer)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
                <h2 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wide">Social Handles</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Instagram Handle</label>
                    <input type="text" value={instagramHandle} onChange={e => setInstagramHandle(e.target.value)}
                      className={inputClass} placeholder="@instagram_username" />
                  </div>
                  <div>
                    <label className={labelClass}>YouTube Channel</label>
                    <input type="text" value={youtubeHandle} onChange={e => setYoutubeHandle(e.target.value)}
                      className={inputClass} placeholder="@youtube_channel" />
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleFetchProfile}
                    disabled={fetchingProfile || (!instagramHandle && !youtubeHandle)}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 disabled:opacity-40 transition-colors"
                  >
                    {fetchingProfile ? "Fetching..." : "Fetch Profile Data"}
                  </button>
                  {fetchingProfile && (
                    <p className="text-xs text-purple-400 mt-1.5 flex items-center gap-1.5">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      {instagramHandle && youtubeHandle
                        ? "Fetching Instagram & YouTube profiles..."
                        : instagramHandle
                        ? "Fetching Instagram profile..."
                        : "Fetching YouTube channel..."}
                    </p>
                  )}
                  {fetchStatus === "success" && !fetchingProfile && (
                    <p className="text-xs text-[#10B981] mt-1.5">Profile data fetched — name and bio updated below.</p>
                  )}
                  {fetchStatus === "error" && !fetchingProfile && (
                    <p className="text-xs text-red-400 mt-1.5">Could not fetch profile — please fill manually.</p>
                  )}
                </div>
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
