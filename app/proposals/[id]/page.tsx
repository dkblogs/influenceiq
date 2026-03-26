"use client"
import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import { supabase } from "@/lib/supabase"

const STATUS_STYLE: Record<string, string> = {
  pending:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
  negotiating: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  agreed:      "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  rejected:    "bg-red-500/10 text-red-400 border-red-500/20",
  withdrawn:   "bg-[#1E1E2E] text-[#64748B] border-[#1E1E2E]",
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

export default function ProposalDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const user = session?.user as any

  const [proposal, setProposal] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null | undefined>(undefined)
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msgText, setMsgText] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)
  const [actionLoading, setActionLoading] = useState("")
  const [showCounter, setShowCounter] = useState(false)
  const [toast, setToast] = useState("")
  const [counter, setCounter] = useState({ remunerationCounter: "", deliverablesCounter: "", timelineCounter: "", revisionsCounter: "", notes: "" })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const role = user?.role
  const myRole = role === "brand" ? "brand" : "influencer"

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated" || !id) return
    loadProposal()
  }, [status, id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`proposal-messages-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ProposalMessage",
          filter: `proposalId=eq.${id}`,
        },
        (payload) => {
          setMessages(prev => {
            // Avoid duplicates (our own optimistic messages)
            if (prev.some(m => m.id === (payload.new as any).id)) return prev
            return [...prev, payload.new as any]
          })
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function loadProposal() {
    const [pRes, mRes] = await Promise.all([
      fetch(`/api/proposals/${id}`),
      fetch(`/api/proposals/${id}/messages`),
    ])
    const [pData, mData] = await Promise.all([pRes.json(), mRes.json()])
    if (pData.proposal) {
      setProposal(pData.proposal)
      setCounter({
        remunerationCounter: pData.proposal.remuneration,
        deliverablesCounter: pData.proposal.deliverables,
        timelineCounter: pData.proposal.timeline,
        revisionsCounter: pData.proposal.revisions,
        notes: "",
      })
    }
    setMessages(mData.messages || [])
    setLoading(false)
  }

  useEffect(() => {
    if (proposal?.status === "agreed") {
      fetch(`/api/proposals/${id}/workspace`)
        .then(r => r.json())
        .then(data => {
          if (data.workspaceId) setWorkspaceId(data.workspaceId)
          else setWorkspaceId(null)
        })
        .catch(() => setWorkspaceId(null))
    }
  }, [proposal?.status, id])

  async function createWorkspace() {
    setCreatingWorkspace(true)
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: id }),
      })
      const data = await res.json()
      if (res.ok && data.id) setWorkspaceId(data.id)
      else showToast("Failed to create workspace")
    } catch {
      showToast("Failed to create workspace")
    }
    setCreatingWorkspace(false)
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000) }

  async function sendMessage() {
    if (!msgText.trim()) return
    setSendingMsg(true)
    const res = await fetch(`/api/proposals/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msgText.trim() }),
    })
    const data = await res.json()
    if (data.message) setMessages(prev => [...prev, data.message])
    setMsgText("")
    setSendingMsg(false)
  }

  async function doAction(action: string, body: Record<string, any> = {}) {
    setActionLoading(action)
    let url = `/api/proposals/${id}`
    let method = "PATCH"
    let payload: Record<string, any> = body

    if (action === "agree") { url = `/api/proposals/${id}/agree`; method = "POST" }
    else if (action === "counter") { url = `/api/proposals/${id}/counter`; method = "POST" }
    else { payload = { status: action } }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setActionLoading("")
    if (!res.ok) { showToast("Action failed. Please try again."); return }
    showToast(action === "agree" ? "🎉 Proposal agreed!" : action === "counter" ? "Counter sent!" : "Done.")
    setShowCounter(false)
    loadProposal()
  }

  async function submitCounter() {
    await doAction("counter", {
      remunerationCounter: counter.remunerationCounter || null,
      deliverablesCounter: counter.deliverablesCounter || null,
      timelineCounter: counter.timelineCounter || null,
      revisionsCounter: counter.revisionsCounter ? Number(counter.revisionsCounter) : null,
      notes: counter.notes || null,
    })
  }

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen bg-[#0A0A0F]"><Navbar />
        <div className="flex items-center justify-center h-64 text-purple-400 text-sm gap-3">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading...
        </div>
      </main>
    )
  }

  if (!proposal) {
    return (
      <main className="min-h-screen bg-[#0A0A0F]"><Navbar />
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-[#F8FAFC] font-medium mb-2">Proposal not found</div>
          <a href="/proposals" className="text-purple-400 text-sm hover:underline">← Back to proposals</a>
        </div>
      </main>
    )
  }

  const latestRound = proposal.rounds?.[proposal.rounds.length - 1]
  const isActive = !["agreed", "rejected", "withdrawn"].includes(proposal.status)
  const isBrandViewing = myRole === "brand"
  const isInfluencerViewing = myRole === "influencer"

  // Determine if current user can act
  const pendingForInfluencer = isInfluencerViewing && (proposal.status === "pending" || (proposal.status === "negotiating" && latestRound?.submittedBy === "brand"))
  const pendingForBrand = isBrandViewing && proposal.status === "negotiating" && latestRound?.submittedBy === "influencer"

  // Effective current terms (latest round counters override originals if set)
  const currentRemuneration = latestRound?.remunerationCounter || proposal.remuneration
  const currentDeliverables = latestRound?.deliverablesCounter || proposal.deliverables
  const currentTimeline = latestRound?.timelineCounter || proposal.timeline
  const currentRevisions = latestRound?.revisionsCounter ?? proposal.revisions

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#12121A] border border-[#1E1E2E] text-[#F8FAFC] text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <a href="/proposals" className="text-[#64748B] hover:text-[#F8FAFC] text-sm transition-colors">← Proposals</a>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#F8FAFC] truncate">{proposal.campaignTitle}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_STYLE[proposal.status] ?? STATUS_STYLE.pending}`}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-[#64748B] mt-0.5">
              {isBrandViewing ? (
                <>With: <a href={`/influencer/${proposal.influencerId}`} className="text-purple-400 hover:text-purple-300 underline">{proposal.influencerName}</a></>
              ) : (
                <>From: <span className="text-[#94A3B8]">{proposal.brandName}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Agreed banner */}
        {proposal.status === "agreed" && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-2xl p-5 mb-6">
            <div className="text-lg font-semibold text-[#10B981] mb-1">✅ Both parties have agreed</div>
            <div className="text-sm text-[#94A3B8]">Final terms: <strong className="text-[#F8FAFC]">{currentRemuneration}</strong> · Timeline: <strong className="text-[#F8FAFC]">{currentTimeline}</strong> · {currentRevisions} revisions</div>
            <div className="flex flex-wrap gap-2 mt-3">
              {isBrandViewing && (
                <a
                  href={`/influencer/${proposal.influencerId}`}
                  className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#0EA572] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  📞 View Contact Details →
                </a>
              )}
              {workspaceId === undefined ? (
                <span className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-lg text-sm">
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/></svg>
                  Opening Workspace...
                </span>
              ) : workspaceId ? (
                <a
                  href={`/workspace/${workspaceId}`}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🚀 Open Campaign Workspace →
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-amber-400 text-sm">⚠️ Workspace not created yet</span>
                  <button
                    onClick={createWorkspace}
                    disabled={creatingWorkspace}
                    className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {creatingWorkspace ? "Creating..." : "Create Workspace"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — Proposal details */}
          <div className="space-y-4">
            {/* Current terms */}
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
              <h2 className="font-semibold text-[#F8FAFC] mb-4">Current Terms</h2>
              <div className="space-y-3">
                {[
                  { label: "Content Type", value: proposal.contentType },
                  { label: "Remuneration", value: currentRemuneration, highlight: true },
                  { label: "Timeline", value: currentTimeline },
                  { label: "Revisions", value: `${currentRevisions} rounds` },
                  { label: "Location", value: proposal.location || "Remote" },
                  { label: "Exclusivity", value: proposal.exclusivity ? "Yes" : "No" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-start gap-3">
                    <span className="text-xs text-[#64748B] flex-shrink-0 mt-0.5">{item.label}</span>
                    <span className={`text-sm font-medium text-right ${item.highlight ? "text-purple-400" : "text-[#F8FAFC]"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description + Deliverables */}
            <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 space-y-4">
              <div>
                <div className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-1.5">Description</div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{proposal.description}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-1.5">Deliverables</div>
                <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-line">{currentDeliverables}</p>
              </div>
              {proposal.additionalTerms && (
                <div>
                  <div className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1.5">Additional Terms</div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{proposal.additionalTerms}</p>
                </div>
              )}
            </div>

            {/* Round history */}
            {proposal.rounds?.length > 0 && (
              <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
                <h3 className="font-semibold text-[#F8FAFC] mb-4 text-sm">Negotiation History</h3>
                <div className="space-y-3">
                  {proposal.rounds.map((round: any) => (
                    <div key={round.id} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs text-purple-400 font-medium">{round.roundNumber}</div>
                        <div className="w-px flex-1 bg-[#1E1E2E] mt-1" />
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[#F8FAFC]">
                            {round.submittedBy === "brand" ? proposal.brandName : proposal.influencerName}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${STATUS_STYLE[round.status] ?? STATUS_STYLE.pending}`}>{round.status}</span>
                          <span className="text-xs text-[#64748B]">{timeAgo(round.createdAt)}</span>
                        </div>
                        {round.remunerationCounter && <p className="text-xs text-[#94A3B8]">💰 {round.remunerationCounter}</p>}
                        {round.timelineCounter && <p className="text-xs text-[#94A3B8]">⏱ {round.timelineCounter}</p>}
                        {round.notes && <p className="text-xs text-[#64748B] mt-1 italic">"{round.notes}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Chat */}
          <div className="flex flex-col bg-[#12121A] rounded-2xl border border-[#1E1E2E] overflow-hidden min-h-[360px] lg:min-h-[480px]">
            <div className="px-5 py-4 border-b border-[#1E1E2E]">
              <h2 className="font-semibold text-[#F8FAFC] text-sm">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[320px] lg:max-h-[400px]">
              {messages.length === 0 ? (
                <div className="text-center text-xs text-[#64748B] py-8">No messages yet. Start the conversation.</div>
              ) : messages.map((msg: any) => {
                const isMine = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-purple-600 text-white rounded-br-sm" : "bg-[#1E1E2E] text-[#F8FAFC] rounded-bl-sm"}`}>
                      {!isMine && <div className="text-xs text-[#64748B] mb-1 capitalize">{msg.senderRole}</div>}
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <div className={`text-xs mt-1 ${isMine ? "text-purple-200/70" : "text-[#64748B]"}`}>{timeAgo(msg.createdAt)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            {isActive && (
              <div className="px-4 py-3 border-t border-[#1E1E2E] flex gap-2">
                <input
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMsg || !msgText.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action bar */}
        {isActive && (
          <div className="mt-6 bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5">
            {pendingForInfluencer && !showCounter && (
              <div>
                <p className="text-sm text-[#94A3B8] mb-4">Review the proposal terms above and choose your response:</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => doAction("agree")}
                    disabled={!!actionLoading}
                    className="bg-[#10B981] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#059669] disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === "agree" ? "Processing..." : "✓ Accept As Is"}
                  </button>
                  <button
                    onClick={() => setShowCounter(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors"
                  >
                    Counter Proposal
                  </button>
                  <button
                    onClick={() => doAction("rejected")}
                    disabled={!!actionLoading}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === "rejected" ? "..." : "✗ Reject"}
                  </button>
                </div>
              </div>
            )}

            {pendingForBrand && !showCounter && (
              <div>
                <p className="text-sm text-[#94A3B8] mb-4">The influencer has submitted a counter proposal. Review the updated terms:</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => doAction("agree")}
                    disabled={!!actionLoading}
                    className="bg-[#10B981] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#059669] disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === "agree" ? "Processing..." : "✓ Accept Counter"}
                  </button>
                  <button
                    onClick={() => setShowCounter(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors"
                  >
                    Send Revised Proposal
                  </button>
                  <button
                    onClick={() => doAction("withdrawn")}
                    disabled={!!actionLoading}
                    className="bg-[#1E1E2E] text-[#64748B] px-5 py-2.5 rounded-xl text-sm font-medium hover:text-[#94A3B8] disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === "withdrawn" ? "..." : "Withdraw"}
                  </button>
                </div>
              </div>
            )}

            {!pendingForInfluencer && !pendingForBrand && !showCounter && isActive && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#64748B]">
                  {isBrandViewing ? "Waiting for influencer's response." : "Waiting for brand's response."}
                </p>
                {isBrandViewing && (
                  <button
                    onClick={() => doAction("withdrawn")}
                    disabled={!!actionLoading}
                    className="text-xs text-[#64748B] hover:text-red-400 transition-colors"
                  >
                    Withdraw proposal
                  </button>
                )}
                {isInfluencerViewing && (
                  <button
                    onClick={() => doAction("rejected")}
                    disabled={!!actionLoading}
                    className="text-xs text-[#64748B] hover:text-red-400 transition-colors"
                  >
                    Reject proposal
                  </button>
                )}
              </div>
            )}

            {/* Counter form */}
            {showCounter && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#F8FAFC] text-sm">
                    {isInfluencerViewing ? "Your Counter Proposal" : "Revised Proposal"}
                  </h3>
                  <button onClick={() => setShowCounter(false)} className="text-xs text-[#64748B] hover:text-[#94A3B8]">Cancel</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Remuneration</label>
                    <input
                      value={counter.remunerationCounter}
                      onChange={e => setCounter(p => ({ ...p, remunerationCounter: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                      placeholder="e.g. ₹30,000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Timeline</label>
                    <input
                      value={counter.timelineCounter}
                      onChange={e => setCounter(p => ({ ...p, timelineCounter: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                      placeholder="e.g. 3 weeks"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Revisions</label>
                    <input
                      type="number"
                      value={counter.revisionsCounter}
                      onChange={e => setCounter(p => ({ ...p, revisionsCounter: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                      min={1} max={10}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Notes to {isInfluencerViewing ? "Brand" : "Influencer"}</label>
                    <input
                      value={counter.notes}
                      onChange={e => setCounter(p => ({ ...p, notes: e.target.value }))}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Deliverables (optional)</label>
                  <textarea
                    value={counter.deliverablesCounter}
                    onChange={e => setCounter(p => ({ ...p, deliverablesCounter: e.target.value }))}
                    rows={3}
                    className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Updated deliverables..."
                  />
                </div>
                <button
                  onClick={submitCounter}
                  disabled={!!actionLoading}
                  className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
                >
                  {actionLoading === "counter" ? "Sending..." : "Send Counter Proposal"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
