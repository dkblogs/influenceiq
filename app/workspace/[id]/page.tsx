"use client"
import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

type Milestone = { id: string; title: string; description?: string; status: string; order: number; completedAt?: string }
type Deliverable = { id: string; title: string; description?: string; fileUrl?: string; status: string; feedback?: string; submittedAt?: string }
type Review = { id: string; reviewerRole: string; rating: number; comment: string; createdAt: string }
type Message = { id: string; senderId: string; senderRole: string; message: string; createdAt: string }
type Workspace = {
  id: string
  proposalId: string
  campaignTitle: string
  status: string
  paymentStatus: string
  paymentAmount?: string
  paymentNotes?: string
  paymentSentAt?: string
  paymentConfirmedAt?: string
  brandId: string
  influencerId: string
  isBrand: boolean
  milestones: Milestone[]
  deliverables: Deliverable[]
  reviews: Review[]
  proposal: {
    id: string
    messages: Message[]
    contentType?: string
    deliverables?: string
    timeline?: string
    revisions?: number
  }
  createdAt: string
}

const TABS = ["Overview", "Milestones", "Deliverables", "Payment", "Reviews", "Chat"] as const
type Tab = typeof TABS[number]

const MILESTONE_STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
}

const DELIVERABLE_STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]",
  submitted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  revision: "bg-red-500/10 text-red-400 border-red-500/20",
  approved: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
}

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
}

// Determine which role owns each milestone based on title keywords
function milestoneOwner(title: string): "brand" | "influencer" | "both" {
  const t = title.toLowerCase()
  if (t.includes("review") || t.includes("confirm") || t.includes("payment")) return "brand"
  if (t.includes("kickoff")) return "both"
  return "influencer"
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`text-xl ${s <= value ? "text-amber-400" : "text-[#1E1E2E]"} ${onChange ? "hover:text-amber-400 transition-colors" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function WorkspacePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const user = session?.user as any

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [toast, setToast] = useState("")
  const [actionLoading, setActionLoading] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Deliverable form
  const [dlForm, setDlForm] = useState({ title: "", description: "", fileUrl: "" })
  const [showDlForm, setShowDlForm] = useState(false)

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Chat
  const [msgText, setMsgText] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated" || !id) return
    loadWorkspace()
  }, [status, id])

  useEffect(() => {
    if (activeTab === "Chat") {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }
  }, [activeTab, workspace?.proposal?.messages])

  async function loadWorkspace() {
    setLoading(true)
    const res = await fetch(`/api/workspace/${id}`)
    if (!res.ok) { router.push("/dashboard"); return }
    const data = await res.json()
    setWorkspace(data)
    setLoading(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  async function updateMilestone(milestoneId: string, milestoneStatus: string) {
    setActionLoading(milestoneId)
    const res = await fetch(`/api/workspace/${id}/milestone`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId, status: milestoneStatus }),
    })
    setActionLoading("")
    if (res.ok) { showToast("Milestone updated"); loadWorkspace() }
    else showToast("Failed to update milestone")
  }

  async function submitDeliverable() {
    if (!dlForm.title.trim()) { showToast("Title required"); return }
    setActionLoading("dl")
    const res = await fetch(`/api/workspace/${id}/deliverable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dlForm),
    })
    setActionLoading("")
    if (res.ok) {
      setDlForm({ title: "", description: "", fileUrl: "" })
      setShowDlForm(false)
      showToast("Deliverable submitted")
      loadWorkspace()
    } else showToast("Failed to submit deliverable")
  }

  async function reviewDeliverable(deliverableId: string, dlStatus: string, feedback: string) {
    setActionLoading(deliverableId)
    const res = await fetch(`/api/workspace/${id}/deliverable`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliverableId, status: dlStatus, feedback }),
    })
    setActionLoading("")
    if (res.ok) { showToast(dlStatus === "approved" ? "Deliverable approved" : "Revision requested"); loadWorkspace() }
    else showToast("Failed to update deliverable")
  }

  async function paymentAction(action: string) {
    setActionLoading("payment")
    const res = await fetch(`/api/workspace/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    setActionLoading("")
    if (res.ok) { showToast(action === "payment_sent" ? "Payment marked as sent" : "Payment confirmed!"); loadWorkspace() }
    else showToast("Failed to update payment")
  }

  async function updatePaymentNotes(notes: string) {
    await fetch(`/api/workspace/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentNotes: notes }),
    })
    loadWorkspace()
  }

  async function submitReview() {
    if (!reviewForm.comment.trim()) { showToast("Comment required"); return }
    setActionLoading("review")
    const res = await fetch(`/api/workspace/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewForm),
    })
    setActionLoading("")
    if (res.ok) { setShowReviewForm(false); showToast("Review submitted!"); loadWorkspace() }
    else { const d = await res.json(); showToast(d.error || "Failed to submit review") }
  }

  async function sendMessage() {
    if (!msgText.trim() || !workspace) return
    setSendingMsg(true)
    const res = await fetch(`/api/proposals/${workspace.proposal.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msgText }),
    })
    setSendingMsg(false)
    if (res.ok) { setMsgText(""); loadWorkspace() }
    else showToast("Failed to send message")
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A12]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#12121A] rounded w-1/2" />
          <div className="h-4 bg-[#12121A] rounded w-1/3" />
          <div className="h-64 bg-[#12121A] rounded" />
        </div>
      </div>
    </div>
  )

  if (!workspace) return null

  const isBrand = workspace.isBrand
  const completedMilestones = workspace.milestones.filter(m => m.status === "completed").length
  const totalMilestones = workspace.milestones.length
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
  const myReview = workspace.reviews.find(r => r.reviewerRole === (isBrand ? "brand" : "influencer"))

  // Chat: all proposal messages, split at workspace createdAt
  const allMessages = workspace.proposal?.messages || []
  const workspaceStartedAt = new Date(workspace.createdAt)
  const preMsgs = allMessages.filter(m => new Date(m.createdAt) < workspaceStartedAt)
  const postMsgs = allMessages.filter(m => new Date(m.createdAt) >= workspaceStartedAt)

  return (
    <div className="min-h-screen bg-[#0A0A12]">
      <Navbar />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1E1E2E] border border-purple-500/30 text-white px-4 py-2.5 rounded-xl text-sm shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-6">
          <a href="/workspaces" className="text-xs text-[#64748B] hover:text-[#94A3B8] mb-3 inline-flex items-center gap-1">
            ← Back to workspaces
          </a>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#F8FAFC]">{workspace.campaignTitle}</h1>
              <p className="text-sm text-[#64748B] mt-1">Campaign Workspace · {isBrand ? "Brand View" : "Influencer View"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${PAYMENT_STATUS_STYLE[workspace.paymentStatus] || PAYMENT_STATUS_STYLE.pending}`}>
                Payment: {workspace.paymentStatus}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20">
                {workspace.status}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
              <span>Campaign progress</span>
              <span>{completedMilestones}/{totalMilestones} milestones</span>
            </div>
            <div className="h-2 bg-[#1E1E2E] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-right text-xs text-purple-400 mt-1">{progress}% complete</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#12121A] border border-[#1E1E2E] rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab ? "bg-purple-600 text-white" : "text-[#64748B] hover:text-[#94A3B8]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
                <h2 className="font-semibold text-[#F8FAFC] mb-4">Campaign Details</h2>
                <div className="space-y-3">
                  {[
                    { label: "Content Type", value: workspace.proposal?.contentType },
                    { label: "Agreed Payment", value: workspace.paymentAmount, highlight: true },
                    { label: "Timeline", value: workspace.proposal?.timeline },
                    { label: "Revisions", value: `${workspace.proposal?.revisions || 2} rounds` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center gap-3">
                      <span className="text-xs text-[#64748B]">{item.label}</span>
                      <span className={`text-sm font-medium ${item.highlight ? "text-purple-400" : "text-[#F8FAFC]"}`}>{item.value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
                <h2 className="font-semibold text-[#F8FAFC] mb-4">Quick Links</h2>
                <div className="space-y-2">
                  <a href={`/proposals/${workspace.proposalId}`} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    📄 View Original Proposal →
                  </a>
                  {isBrand && (
                    <a href={`/influencer/${workspace.influencerId}`} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      👤 View Influencer Profile →
                    </a>
                  )}
                  <button onClick={() => setActiveTab("Chat")} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    💬 Open Chat →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
              <h2 className="font-semibold text-[#F8FAFC] mb-3">Agreed Deliverables</h2>
              <p className="text-sm text-[#94A3B8] whitespace-pre-line leading-relaxed">{workspace.proposal?.deliverables || "—"}</p>
            </div>

            {(() => {
              const next = workspace.milestones.find(m => m.status !== "completed")
              if (!next) return (
                <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-2xl p-5 text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="font-semibold text-[#10B981]">All milestones completed!</div>
                  <div className="text-sm text-[#94A3B8] mt-1">Don&apos;t forget to leave a review for each other</div>
                  {!myReview && (
                    <button onClick={() => setActiveTab("Reviews")} className="mt-3 bg-[#10B981] hover:bg-[#0EA572] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Leave a Review →
                    </button>
                  )}
                </div>
              )
              const owner = milestoneOwner(next.title)
              const isYourTurn = owner === "both" || (isBrand ? owner === "brand" : owner === "influencer")
              return (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-purple-400 uppercase tracking-wide">Next Milestone</div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isYourTurn ? "bg-purple-600/30 text-purple-300" : "bg-[#1E1E2E] text-[#64748B]"}`}>
                      {isYourTurn ? "Your turn" : `${owner === "brand" ? "Brand" : "Influencer"}'s turn`}
                    </span>
                  </div>
                  <div className="font-semibold text-[#F8FAFC]">{next.title}</div>
                  {next.description && <div className="text-sm text-[#94A3B8] mt-1">{next.description}</div>}
                </div>
              )
            })()}
          </div>
        )}

        {/* ── MILESTONES ── */}
        {activeTab === "Milestones" && (
          <div className="space-y-3">
            {workspace.milestones.map((m, i) => {
              const owner = milestoneOwner(m.title)
              const canAct = m.status !== "completed" && (owner === "both" || (isBrand ? owner === "brand" : owner === "influencer"))
              const waitingFor = owner === "brand" ? "Brand" : "Influencer"
              const isYourTurn = owner === "both" || (isBrand ? owner === "brand" : owner === "influencer")

              return (
                <div key={m.id} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        m.status === "completed" ? "bg-[#10B981] text-white" : "bg-[#1E1E2E] text-[#64748B]"
                      }`}>
                        {m.status === "completed" ? "✓" : i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-[#F8FAFC]">{m.title}</span>
                          {m.status !== "completed" && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isYourTurn ? "bg-purple-600/20 text-purple-300 border border-purple-500/20" : "bg-[#1E1E2E] text-[#64748B]"
                            }`}>
                              {isYourTurn ? "Your turn" : `${waitingFor}'s turn`}
                            </span>
                          )}
                        </div>
                        {m.description && <div className="text-sm text-[#94A3B8] mt-0.5">{m.description}</div>}
                        {m.completedAt && <div className="text-xs text-[#10B981] mt-1">Completed {timeAgo(m.completedAt)}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${MILESTONE_STATUS_STYLE[m.status] || MILESTONE_STATUS_STYLE.pending}`}>
                        {m.status}
                      </span>
                      {m.status !== "completed" && (
                        canAct ? (
                          <div className="flex gap-1">
                            {m.status === "pending" && (
                              <button
                                onClick={() => updateMilestone(m.id, "in-progress")}
                                disabled={actionLoading === m.id}
                                className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Start
                              </button>
                            )}
                            <button
                              onClick={() => updateMilestone(m.id, "completed")}
                              disabled={actionLoading === m.id}
                              className="text-xs bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/20 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading === m.id ? "..." : "Mark Done"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#64748B] italic">Waiting for {waitingFor}...</span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── DELIVERABLES ── */}
        {activeTab === "Deliverables" && (
          <div className="space-y-4">
            {!isBrand && (
              <button
                onClick={() => setShowDlForm(v => !v)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 text-sm font-medium transition-colors"
              >
                + Submit New Deliverable
              </button>
            )}

            {showDlForm && !isBrand && (
              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 space-y-3">
                <h3 className="font-semibold text-[#F8FAFC]">Submit Deliverable</h3>
                <input
                  type="text"
                  value={dlForm.title}
                  onChange={e => setDlForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Deliverable title (e.g. Instagram Reel — Draft 1)"
                  className="w-full bg-[#0A0A12] border border-[#1E1E2E] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50"
                />
                <textarea
                  value={dlForm.description}
                  onChange={e => setDlForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description or notes..."
                  rows={3}
                  className="w-full bg-[#0A0A12] border border-[#1E1E2E] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50 resize-none"
                />
                <input
                  type="url"
                  value={dlForm.fileUrl}
                  onChange={e => setDlForm(f => ({ ...f, fileUrl: e.target.value }))}
                  placeholder="Link to file / Google Drive / Dropbox (optional)"
                  className="w-full bg-[#0A0A12] border border-[#1E1E2E] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={submitDeliverable}
                    disabled={actionLoading === "dl"}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "dl" ? "Submitting..." : "Submit Deliverable"}
                  </button>
                  <button onClick={() => setShowDlForm(false)} className="px-4 bg-[#1E1E2E] hover:bg-[#2A2A3E] text-[#94A3B8] rounded-xl text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {workspace.deliverables.length === 0 ? (
              <div className="text-center py-12 text-[#64748B]">
                <div className="text-3xl mb-3">📦</div>
                <p className="text-sm">No deliverables yet</p>
                {!isBrand && <p className="text-xs mt-1">Submit your first deliverable above</p>}
              </div>
            ) : (
              workspace.deliverables.map(d => (
                <DeliverableCard
                  key={d.id}
                  deliverable={d}
                  isBrand={isBrand}
                  actionLoading={actionLoading}
                  onReview={reviewDeliverable}
                />
              ))
            )}
          </div>
        )}

        {/* ── PAYMENT ── */}
        {activeTab === "Payment" && (
          <div className="space-y-4">
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6">
              <h2 className="font-semibold text-[#F8FAFC] mb-5">Payment Status</h2>

              {/* Two-step tracker */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${
                  workspace.paymentSentAt ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" : "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]"
                }`}>
                  {workspace.paymentSentAt ? "✓" : "1"} Brand sent
                </div>
                <div className="h-px flex-1 bg-[#1E1E2E]" />
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${
                  workspace.paymentConfirmedAt ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" : "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]"
                }`}>
                  {workspace.paymentConfirmedAt ? "✓" : "2"} Influencer confirmed
                </div>
              </div>

              {workspace.paymentAmount && (
                <div className="text-2xl font-bold text-purple-400 mb-4">{workspace.paymentAmount}</div>
              )}

              {workspace.paymentNotes && (
                <div className="bg-[#0A0A12] rounded-xl p-3 mb-4 text-sm text-[#94A3B8]">
                  <div className="text-xs text-[#64748B] mb-1 uppercase tracking-wide">Notes</div>
                  {workspace.paymentNotes}
                </div>
              )}

              {/* Brand controls */}
              {isBrand && (
                <div className="space-y-3">
                  {!workspace.paymentSentAt ? (
                    <button
                      onClick={() => paymentAction("payment_sent")}
                      disabled={actionLoading === "payment"}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-colors"
                    >
                      {actionLoading === "payment" ? "Updating..." : "💸 Mark Payment as Sent"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-[#10B981]">
                      ✓ You marked payment as sent {timeAgo(workspace.paymentSentAt)}
                    </div>
                  )}
                  {workspace.paymentConfirmedAt && (
                    <div className="flex items-center gap-2 text-sm text-[#10B981]">
                      ✓ Influencer confirmed receipt {timeAgo(workspace.paymentConfirmedAt)}
                    </div>
                  )}
                  <textarea
                    placeholder="Add payment notes (UPI ID, transaction ref, etc.)"
                    defaultValue={workspace.paymentNotes || ""}
                    onBlur={e => { if (e.target.value !== (workspace.paymentNotes || "")) updatePaymentNotes(e.target.value) }}
                    rows={3}
                    className="w-full bg-[#0A0A12] border border-[#1E1E2E] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>
              )}

              {/* Influencer controls */}
              {!isBrand && (
                <div className="space-y-3">
                  {!workspace.paymentSentAt ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
                      ⏳ Waiting for brand to send payment. Reach out via chat if you have questions.
                    </div>
                  ) : !workspace.paymentConfirmedAt ? (
                    <div className="space-y-3">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
                        💸 Brand has marked payment as sent {timeAgo(workspace.paymentSentAt)}. Confirm once you receive it.
                      </div>
                      <button
                        onClick={() => paymentAction("payment_confirmed")}
                        disabled={actionLoading === "payment"}
                        className="w-full bg-[#10B981] hover:bg-[#0EA572] disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-colors"
                      >
                        {actionLoading === "payment" ? "Confirming..." : "✅ Confirm Payment Received"}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-4 text-sm text-[#10B981]">
                      ✅ You confirmed receipt {timeAgo(workspace.paymentConfirmedAt)}. Payment complete!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === "Reviews" && (
          <div className="space-y-4">
            {!myReview && (
              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-[#F8FAFC]">Leave a Review</h2>
                  {!showReviewForm && (
                    <button onClick={() => setShowReviewForm(true)} className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors">
                      Write Review
                    </button>
                  )}
                </div>
                {showReviewForm && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-[#64748B] mb-2">Rating</div>
                      <StarRating value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                    </div>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder={`Share your experience working with this ${isBrand ? "influencer" : "brand"}...`}
                      rows={4}
                      className="w-full bg-[#0A0A12] border border-[#1E1E2E] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={submitReview}
                        disabled={actionLoading === "review"}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {actionLoading === "review" ? "Submitting..." : "Submit Review"}
                      </button>
                      <button onClick={() => setShowReviewForm(false)} className="px-4 bg-[#1E1E2E] hover:bg-[#2A2A3E] text-[#94A3B8] rounded-xl text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {workspace.reviews.length === 0 ? (
              <div className="text-center py-12 text-[#64748B]">
                <div className="text-3xl mb-3">⭐</div>
                <p className="text-sm">No reviews yet</p>
              </div>
            ) : (
              workspace.reviews.map(r => (
                <div key={r.id} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#1E1E2E] text-[#94A3B8]">
                        {r.reviewerRole === "brand" ? "🏢 Brand" : "⭐ Influencer"}
                      </span>
                      <span className="text-xs text-[#64748B]">{timeAgo(r.createdAt)}</span>
                    </div>
                    <StarRating value={r.rating} />
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── CHAT ── */}
        {activeTab === "Chat" && (
          <div className="flex flex-col h-[60vh]">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {allMessages.length === 0 && (
                <div className="text-center py-12 text-[#64748B]">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}

              {/* Pre-workspace messages (negotiation context) */}
              {preMsgs.map(msg => {
                const isMe = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm opacity-60 ${
                      isMe ? "bg-purple-600/60 text-white rounded-br-sm" : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] rounded-bl-sm"
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-purple-300" : "text-[#64748B]"}`}>{timeAgo(msg.createdAt)}</p>
                    </div>
                  </div>
                )
              })}

              {/* Divider */}
              {preMsgs.length > 0 && (
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-[#1E1E2E]" />
                  <span className="text-xs text-[#64748B] whitespace-nowrap px-2">── Proposal agreed · Workspace started ──</span>
                  <div className="flex-1 h-px bg-[#1E1E2E]" />
                </div>
              )}

              {/* Post-workspace messages */}
              {postMsgs.map(msg => {
                const isMe = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe ? "bg-purple-600 text-white rounded-br-sm" : "bg-[#12121A] border border-[#1E1E2E] text-[#F8FAFC] rounded-bl-sm"
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-purple-300" : "text-[#64748B]"}`}>{timeAgo(msg.createdAt)}</p>
                    </div>
                  </div>
                )
              })}

              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type a message..."
                className="flex-1 bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={sendMessage}
                disabled={sendingMsg || !msgText.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl px-5 text-sm font-medium transition-colors"
              >
                {sendingMsg ? "..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DeliverableCard({
  deliverable,
  isBrand,
  actionLoading,
  onReview,
}: {
  deliverable: Deliverable
  isBrand: boolean
  actionLoading: string
  onReview: (id: string, status: string, feedback: string) => void
}) {
  const [feedback, setFeedback] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="font-medium text-[#F8FAFC]">{deliverable.title}</div>
          {deliverable.description && <div className="text-sm text-[#94A3B8] mt-0.5">{deliverable.description}</div>}
          {deliverable.fileUrl && (
            <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-flex items-center gap-1">
              🔗 View file →
            </a>
          )}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${DELIVERABLE_STATUS_STYLE[deliverable.status] || DELIVERABLE_STATUS_STYLE.pending}`}>
          {deliverable.status}
        </span>
      </div>

      {deliverable.feedback && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 text-sm text-red-300">
          <div className="text-xs text-[#64748B] mb-1">Feedback</div>
          {deliverable.feedback}
        </div>
      )}

      {isBrand && deliverable.status === "submitted" && (
        <div className="space-y-2">
          {showFeedback ? (
            <>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Add revision notes..."
                rows={2}
                className="w-full bg-[#0A0A12] border border-[#1E1E2E] rounded-xl px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500/50 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { onReview(deliverable.id, "revision", feedback); setShowFeedback(false) }}
                  disabled={actionLoading === deliverable.id}
                  className="flex-1 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  Request Revision
                </button>
                <button onClick={() => setShowFeedback(false)} className="px-3 text-sm bg-[#1E1E2E] text-[#94A3B8] rounded-xl hover:bg-[#2A2A3E] transition-colors">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onReview(deliverable.id, "approved", "")}
                disabled={actionLoading === deliverable.id}
                className="flex-1 text-sm bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/20 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {actionLoading === deliverable.id ? "..." : "✓ Approve"}
              </button>
              <button
                onClick={() => setShowFeedback(true)}
                className="flex-1 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-xl transition-colors"
              >
                Request Revision
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
