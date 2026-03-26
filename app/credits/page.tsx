"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import { useApp } from "@/app/context/AppContext"

type Transaction = {
  id: string
  type: string
  amount: number
  createdAt: string
}

function txIcon(type: string, amount: number): string {
  if (amount > 0) {
    if (type.includes("signup") || type.includes("bonus")) return "🎁"
    if (type.includes("purchase") || type.includes("payment")) return "💳"
    return "💳"
  }
  if (type.includes("unlock") || type.includes("contact")) return "🔓"
  if (type.includes("campaign") || type.includes("apply")) return "📋"
  if (type.includes("ai_report") || type.includes("report") || type.includes("score")) return "🤖"
  if (type.includes("bio") || type.includes("writer")) return "✍️"
  if (type.includes("proposal")) return "📤"
  if (type.includes("verif")) return "✅"
  return "💬"
}

function txLabel(type: string, amount: number): string {
  if (amount > 0) {
    if (type.includes("signup") || type.includes("bonus")) return "Signup bonus"
    if (type.includes("starter")) return "Purchased Starter pack"
    if (type.includes("growth")) return "Purchased Growth pack"
    if (type.includes("agency")) return "Purchased Agency pack"
    if (type.includes("purchase") || type.includes("payment")) return "Credits purchased"
    return "Credits added"
  }
  if (type.includes("unlock") || type.includes("contact")) return "Contact unlocked"
  if (type.includes("campaign") || type.includes("apply")) return "Applied to campaign"
  if (type.includes("ai_report") || type.includes("report") || type.includes("score")) return "AI Score generated"
  if (type.includes("bio") || type.includes("writer")) return "Bio writer used"
  if (type.includes("proposal")) return "Proposal sent"
  if (type.includes("verif")) return "Verification badge requested"
  return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) +
    " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
}

type Filter = "all" | "in" | "out"

export default function CreditHistory() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { credits } = useApp()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/credit-history")
      .then(r => r.json())
      .then(d => { setTransactions(d.transactions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [status])

  const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  const filtered = transactions.filter(t => {
    if (filter === "in") return t.amount > 0
    if (filter === "out") return t.amount < 0
    return true
  })

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="px-4 md:px-8 py-8 md:py-10 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Credit History</h1>
          <p className="text-sm text-[#64748B] mt-1">All your credit transactions in one place</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4 text-center">
            <div className="text-xs text-[#64748B] mb-1">Balance</div>
            <div className="text-2xl font-bold text-purple-400">{credits ?? 0}</div>
            <div className="text-xs text-[#64748B]">credits</div>
          </div>
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4 text-center">
            <div className="text-xs text-[#64748B] mb-1">Total earned</div>
            <div className="text-2xl font-bold text-[#10B981]">+{totalIn}</div>
            <div className="text-xs text-[#64748B]">credits in</div>
          </div>
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4 text-center">
            <div className="text-xs text-[#64748B] mb-1">Total spent</div>
            <div className="text-2xl font-bold text-red-400">-{totalOut}</div>
            <div className="text-xs text-[#64748B]">credits out</div>
          </div>
        </div>

        <a
          href="/pricing"
          className="flex items-center justify-between w-full bg-purple-600/10 border border-purple-500/20 rounded-xl px-4 py-3 mb-6 hover:bg-purple-600/20 transition-colors"
        >
          <span className="text-sm text-purple-300 font-medium">Need more credits?</span>
          <span className="text-sm text-purple-400 font-medium">Buy credits →</span>
        </a>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "in", "out"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {f === "all" ? "All" : f === "in" ? "Credits In" : "Credits Out"}
            </button>
          ))}
          <span className="ml-auto text-xs text-[#64748B] self-center">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Transaction list */}
        {filtered.length === 0 ? (
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-10 text-center">
            <div className="text-3xl mb-3">💳</div>
            <p className="text-[#94A3B8] text-sm">
              {transactions.length === 0
                ? "No transactions yet. Start using InfluenceIQ to see your credit history here."
                : "No transactions match this filter."}
            </p>
          </div>
        ) : (
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
            {filtered.map((tx, i) => (
              <div
                key={tx.id}
                className={`flex items-center gap-4 px-4 py-3.5 ${i !== filtered.length - 1 ? "border-b border-[#1E1E2E]" : ""}`}
              >
                <div className="text-xl w-8 text-center flex-shrink-0">{txIcon(tx.type, tx.amount)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#F8FAFC]">{txLabel(tx.type, tx.amount)}</div>
                  <div className="text-xs text-[#64748B] mt-0.5">{formatDate(tx.createdAt)}</div>
                </div>
                <div className={`text-sm font-semibold flex-shrink-0 ${tx.amount > 0 ? "text-[#10B981]" : "text-red-400"}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-8 text-center text-sm text-[#64748B] mt-8">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>
    </main>
  )
}
