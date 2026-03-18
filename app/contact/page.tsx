"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Navbar from "@/app/components/Navbar"

const SUBJECTS = [
  "General inquiry",
  "Technical issue",
  "Partnership",
  "Report a problem",
  "Billing issue",
  "Other",
]

export default function Contact() {
  const { data: session, status } = useSession()
  const user = session?.user as any
  const loggedIn = status !== "loading" && !!session

  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const inputClass = "w-full px-4 py-2.5 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500 transition-colors"
  const readonlyClass = "w-full px-4 py-2.5 bg-[#0D0D1A] border border-[#1E1E2E] rounded-lg text-sm text-[#64748B] cursor-not-allowed"
  const selectClass = "w-full px-4 py-2.5 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500 transition-colors"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalName = loggedIn ? user?.name : name
    const finalEmail = loggedIn ? user?.email : email
    if (!finalName || !finalEmail || !message.trim()) {
      setError("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    setError("")
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id || null,
        name: finalName,
        email: finalEmail,
        subject,
        message,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Something went wrong"); setSubmitting(false); return }
    setSuccess(true)
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">

      <Navbar />

      <div className="px-4 md:px-8 py-10 md:py-16 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC] mb-3">
            {loggedIn ? `Hi ${user?.name?.split(" ")[0]}, how can we help?` : "Get in touch"}
          </h1>
          <p className="text-[#94A3B8] text-base">We reply within 24 hours on working days.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form */}
          <div className="lg:col-span-2">
            {success ? (
              <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">Message sent!</h2>
                <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
                  Thanks for reaching out. We'll get back to you at <span className="text-[#F8FAFC]">{loggedIn ? user?.email : email}</span> within 24 hours.
                </p>
                <a href="/" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
                  Back to home
                </a>
              </div>
            ) : (
              <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6">
                <h2 className="font-semibold text-[#F8FAFC] mb-5">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                  {loggedIn ? (
                    /* Logged-in: pre-filled read-only name + email */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Name</label>
                        <input type="text" value={user?.name || ""} readOnly className={readonlyClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Email</label>
                        <input type="email" value={user?.email || ""} readOnly className={readonlyClass} />
                      </div>
                    </div>
                  ) : (
                    /* Guest: editable name + email */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Full name <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Email address <span className="text-red-400">*</span></label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Subject</label>
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className={selectClass}>
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Message <span className="text-red-400">*</span></label>
                    <textarea
                      placeholder="How can we help you?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg border border-red-500/20">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
                  >
                    {submitting ? "Sending..." : "Send message"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Contact info sidebar */}
          <div className="space-y-4">
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5">
              <div className="text-2xl mb-3">📧</div>
              <div className="font-medium text-[#F8FAFC] mb-1">Email us directly</div>
              <div className="text-sm text-[#64748B] mb-2">We reply within 24 hours on working days.</div>
              <a href="mailto:hello@influenceiq.in" className="text-sm text-purple-400 font-medium hover:text-purple-300 transition-colors">
                hello@influenceiq.in
              </a>
            </div>

            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5">
              <div className="text-2xl mb-3">💬</div>
              <div className="font-medium text-[#F8FAFC] mb-1">Support hours</div>
              <div className="text-sm text-[#64748B]">Monday to Saturday<br />10am – 6pm IST</div>
            </div>

            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-5">
              <div className="text-2xl mb-3">🔵</div>
              <div className="font-medium text-[#F8FAFC] mb-1">Brand verification</div>
              <div className="text-sm text-[#64748B] mb-3">Get a verified badge on your brand profile and campaigns.</div>
              <a href="/verify-brand" className="text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors">
                Apply for verification →
              </a>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
              <div className="font-medium text-[#F8FAFC] mb-1">For influencers</div>
              <div className="text-sm text-[#94A3B8] mb-3">Want to list your profile or have questions about getting discovered?</div>
              <a href="/discover" className="text-sm text-purple-400 font-medium hover:text-purple-300 transition-colors">
                Explore the platform →
              </a>
            </div>
          </div>

        </div>
      </div>

      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-8 text-center text-sm text-[#64748B] mt-8">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>
    </main>
  )
}
