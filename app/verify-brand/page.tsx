"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function VerifyBrand() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any

  const [form, setForm] = useState({
    brandName: user?.name || "",
    gst: "",
    website: "",
    linkedin: "",
    description: "",
    docsLink: "",
    email: user?.email || "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Pre-fill once session loads
  const prefilled = {
    brandName: form.brandName || user?.name || "",
    email: form.email || user?.email || "",
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.gst.trim()) { setError("GST number is required"); return }
    if (!form.website.trim()) { setError("Business website is required"); return }
    if (!form.description.trim()) { setError("Business description is required"); return }
    setSubmitting(true)
    setError("")
    const res = await fetch("/api/verify-brand-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, brandName: prefilled.brandName, email: prefilled.email, userId: user?.id }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setSubmitting(false); return }
    setSuccess(true)
    setSubmitting(false)
  }

  const inputClass = "w-full px-4 py-2.5 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 transition-colors"

  if (success) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">Request submitted!</h2>
          <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
            We've received your verification request and will review it within 24–48 hours. You'll be notified at <span className="text-[#F8FAFC]">{prefilled.email}</span>.
          </p>
          <a href="/dashboard" className="block w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20 text-center">
            Back to dashboard
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#1E1E2E] sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md z-50">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold text-[#F8FAFC]">Influence<span className="text-purple-400">IQ</span></span>
        </a>
        <a href="/dashboard" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">← Dashboard</a>
      </nav>

      <div className="px-4 md:px-8 py-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full mb-3 border border-blue-500/20">
            <span>🔵</span> Brand Verification
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC] mb-2">
            Get your brand verified
          </h1>
          <p className="text-[#94A3B8] text-sm max-w-xl">
            Verified brands get a trust badge on all campaign listings, attract more applicants, and gain priority placement in influencer search results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold text-[#F8FAFC] mb-1">Verification request</h2>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Brand / Company name</label>
                <input
                  type="text"
                  value={prefilled.brandName}
                  readOnly
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Contact email</label>
                <input
                  type="email"
                  value={prefilled.email}
                  readOnly
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">GST Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gst}
                  onChange={(e) => set("gst", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Business website URL <span className="text-red-400">*</span></label>
                <input
                  type="url"
                  placeholder="https://yourbrand.com"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">LinkedIn company page URL <span className="text-[#64748B] font-normal">(optional)</span></label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/company/yourbrand"
                  value={form.linkedin}
                  onChange={(e) => set("linkedin", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Brief business description <span className="text-red-400">*</span></label>
                <textarea
                  placeholder="Describe your business — what you sell, your target market, and how you work with influencers..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                  Document link <span className="text-[#64748B] font-normal">(optional but recommended)</span>
                </label>
                <input
                  type="url"
                  placeholder="Google Drive / Dropbox link to GST certificate, incorporation certificate, etc."
                  value={form.docsLink}
                  onChange={(e) => set("docsLink", e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-[#64748B] mt-1.5">Share a Drive or Dropbox folder with your documents. Make sure the link is set to "Anyone with link can view".</p>
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg border border-red-500/20">{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
              >
                {submitting ? "Submitting..." : "Submit verification request"}
              </button>
            </form>
          </div>

          {/* Sidebar info */}
          <div className="space-y-5">

            {/* Benefits */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5">
              <h3 className="font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
                <span className="text-blue-400">✓</span> Benefits of verification
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: "🏷️", title: "Trust badge", desc: "Blue ✓ Verified badge on all campaigns and brand listings" },
                  { icon: "📈", title: "More applications", desc: "Verified brands receive 2–3× more influencer applications" },
                  { icon: "⚡", title: "Priority listing", desc: "Appear higher in brand discovery results" },
                  { icon: "🤝", title: "Credibility", desc: "Influencers trust verified brands for timely payments" },
                ].map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{b.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-[#F8FAFC]">{b.title}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{b.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accepted documents */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5">
              <h3 className="font-semibold text-[#F8FAFC] mb-3">Accepted documents</h3>
              <ul className="space-y-2">
                {[
                  "GST Registration Certificate",
                  "Company Incorporation Certificate",
                  "Business PAN Card",
                  "Official company website",
                ].map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <span className="text-[#10B981] text-xs">✓</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Process */}
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5">
              <h3 className="font-semibold text-[#F8FAFC] mb-3">What happens next</h3>
              <ol className="space-y-3">
                {[
                  { step: "1", text: "We receive your request and documents" },
                  { step: "2", text: "Our team manually reviews within 24–48 hours" },
                  { step: "3", text: "You get notified by email with the outcome" },
                  { step: "4", text: "Verified badge appears instantly on approval" },
                ].map((s) => (
                  <li key={s.step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5">{s.step}</span>
                    <span className="text-sm text-[#94A3B8]">{s.text}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-[#64748B] mt-4 pt-4 border-t border-[#1E1E2E]">Verification is free and permanent unless your business details change.</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
