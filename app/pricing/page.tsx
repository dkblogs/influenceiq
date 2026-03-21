"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import { useApp } from "@/app/context/AppContext"

const brandActions: [string, string][] = [
  ["Browse and search influencers", "Free"],
  ["Send collaboration proposal", "10 credits"],
  ["Full AI scoring report", "3 credits"],
  ["Contact details revealed on proposal agreement", "Free"],
  ["Post an open campaign", "15 credits"],
]

const influencerActions: [string, string][] = [
  ["List your profile", "Free"],
  ["Browse and discover brands", "Free"],
  ["Receive collaboration requests", "Free"],
  ["Generate AI Score & Report", "2 credits"],
  ["Send collaboration request to brand", "10 credits"],
  ["Apply to open brand campaign", "2 credits"],
  ["Get verified badge", "20 credits"],
]

function ActionRow({ action, cost }: { action: string; cost: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#1E1E2E]">
      <span className="text-sm text-[#94A3B8]">{action}</span>
      <span className={`text-sm font-medium whitespace-nowrap ml-4 ${cost === "Free" ? "text-[#10B981]" : "text-purple-400"}`}>{cost}</span>
    </div>
  )
}

function ActionCosts() {
  const { data: session, status } = useSession()
  const role = status === "authenticated" ? session?.user?.role : null

  const showBrand = !role || role === "brand"
  const showInfluencer = !role || role === "influencer"
  const singleColumn = role === "brand" || role === "influencer"
  const heading = role ? "What each action costs you" : "What each action costs"
  const subheading = role ? "" : "One credit system for both brands and influencers."

  return (
    <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 md:p-8 mb-8">
      <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC] mb-2">{heading}</h2>
      {subheading && <p className="text-sm text-[#64748B] mb-6">{subheading}</p>}
      <div className={`grid grid-cols-1 gap-6 md:gap-8 ${!singleColumn ? "md:grid-cols-2" : "max-w-lg mx-auto"}`}>
        {showBrand && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-cyan-500/10 rounded-md flex items-center justify-center text-xs font-medium text-cyan-400 border border-cyan-500/20">B</div>
              <span className="font-medium text-[#F8FAFC] text-sm">For Brands</span>
            </div>
            <div className="space-y-3">
              {brandActions.map(([action, cost]) => <ActionRow key={action} action={action} cost={cost} />)}
            </div>
          </div>
        )}
        {showInfluencer && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-purple-500/10 rounded-md flex items-center justify-center text-xs font-medium text-purple-400 border border-purple-500/20">I</div>
              <span className="font-medium text-[#F8FAFC] text-sm">For Influencers</span>
            </div>
            <div className="space-y-3">
              {influencerActions.map(([action, cost]) => <ActionRow key={action} action={action} cost={cost} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfluencerNote() {
  const { data: session } = useSession()
  if (session?.user?.role !== "influencer") return null
  return (
    <div
      className="mb-10 rounded-2xl bg-[#12100A] p-7 relative overflow-hidden"
      style={{ boxShadow: "0 0 0 1.5px #f59e0b55, 0 0 40px 0 #f59e0b18, inset 0 0 40px 0 #f59e0b08", borderLeft: "4px solid #f59e0b" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🧡</span>
        <span className="text-amber-300 font-bold text-lg tracking-tight">A note from us to you 💛</span>
      </div>
      <div className="space-y-3 text-[#e2c97e] italic leading-relaxed text-sm md:text-base">
        <p>
          We built InfluenceIQ because we believe creators deserve better. Most platforms take 10–30% of everything you earn — silently, every single deal.
        </p>
        <p className="font-semibold not-italic text-amber-300">We don&apos;t do that. We never will.</p>
        <p>
          The small credit system you see here exists for one reason only — to keep InfluenceIQ running, improving, and free from investor pressure to monetize your relationships. Every credit you spend goes directly into maintaining the AI, the platform, and the team that fights for creators every day.
        </p>
        <p className="font-semibold not-italic text-amber-200">You are not the product here. You are the reason we exist.</p>
        <p className="not-italic text-amber-400/70 text-sm mt-2">— The InfluenceIQ Team 🧡</p>
      </div>
    </div>
  )
}

export default function Pricing() {
  const { data: session } = useSession()
  const { refreshCredits } = useApp()
  const router = useRouter()
  const [toast, setToast] = useState("")
  const [payingPlan, setPayingPlan] = useState<string | null>(null)
  const user = session?.user as any

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 4000)
  }

  async function handlePayment(amount: number, credits: number, plan: string) {
    if (!user?.id) {
      router.push("/signup")
      return
    }

    setPayingPlan(plan)
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, credits, plan }),
      })
      const data = await res.json()
      if (!data.orderId) { showToast("Payment setup failed. Try again."); return }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "InfluenceIQ",
        description: `${plan} Plan — ${credits} credits`,
        order_id: data.orderId,
        handler: async function (response: any) {
          const result = await fetch("/api/payment-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credits,
              plan,
              razorpay_payment_id: response.razorpay_payment_id,
              userId: user.id,
            }),
          })
          const resultData = await result.json()
          if (resultData.success) {
            await refreshCredits()
            window.dispatchEvent(new Event("credits-updated"))
            showToast(`✅ ${credits} credits added! New total: ${resultData.newCredits}`)
          }
        },
        modal: { ondismiss: () => setPayingPlan(null) },
        prefill: { name: user.name || "", email: user.email || "" },
        theme: { color: "#7C3AED" },
      }

      const razor = new (window as any).Razorpay(options)
      razor.open()
    } finally {
      setPayingPlan(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#10B981] text-white text-sm px-5 py-3 rounded-xl shadow-lg shadow-black/30 animate-fade-in">
          {toast}
        </div>
      )}

      <div className="px-4 md:px-8 py-12 md:py-16 max-w-5xl mx-auto">

        <InfluencerNote />

        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC] mb-4">Simple, pay-as-you-go pricing</h1>
          <p className="text-[#94A3B8] text-base md:text-lg">One credit system for everyone — brands and influencers alike.</p>
          <div className="inline-block bg-[#10B981]/10 text-[#10B981] text-sm px-4 py-1 rounded-full mt-4 border border-[#10B981]/20">
            Every new account gets 5 free credits — no card needed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-16">

          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 md:p-8 hover:border-purple-500/30 transition-colors">
            <div className="text-sm font-medium text-[#94A3B8] mb-2">Starter</div>
            <div className="text-4xl font-bold text-[#F8FAFC] mb-1">₹499</div>
            <div className="text-sm text-[#64748B] mb-6">100 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>Unlock 20 influencer contacts</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>5 AI reports</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>10 collaboration requests</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>Post 6 open campaigns</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>50 campaign applications</li>
            </ul>
            <button onClick={() => handlePayment(499, 100, "Starter")} disabled={!!payingPlan} className="w-full border border-purple-500/50 text-purple-400 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {payingPlan === "Starter" ? "Opening payment…" : "Buy Starter"}
            </button>
          </div>

          <div className="bg-purple-600 rounded-2xl p-6 md:p-8 relative shadow-2xl shadow-purple-500/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">Most popular</div>
            <div className="text-sm font-medium text-purple-200 mb-2">Growth</div>
            <div className="text-4xl font-bold text-white mb-1">₹1,499</div>
            <div className="text-sm text-purple-300 mb-6">400 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>Unlock 80 influencer contacts</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>20 AI reports</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>40 collaboration requests</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>Post 26 open campaigns</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>200 campaign applications</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>Priority support</li>
            </ul>
            <button onClick={() => handlePayment(1499, 400, "Growth")} disabled={!!payingPlan} className="w-full bg-white text-purple-600 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {payingPlan === "Growth" ? "Opening payment…" : "Buy Growth"}
            </button>
          </div>

          <div className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 md:p-8 hover:border-purple-500/30 transition-colors">
            <div className="text-sm font-medium text-[#94A3B8] mb-2">Agency</div>
            <div className="text-4xl font-bold text-[#F8FAFC] mb-1">₹3,999</div>
            <div className="text-sm text-[#64748B] mb-6">1,200 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>Unlock 240 influencer contacts</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>60 AI reports</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>120 collaboration requests</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>Post 80 open campaigns</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>600 campaign applications</li>
              <li className="flex items-center gap-2 text-sm text-[#94A3B8]"><span className="text-[#10B981]">✓</span>CSV export + API access</li>
            </ul>
            <button onClick={() => handlePayment(3999, 1200, "Agency")} disabled={!!payingPlan} className="w-full border border-purple-500/50 text-purple-400 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {payingPlan === "Agency" ? "Opening payment…" : "Buy Agency"}
            </button>
          </div>

        </div>

        <ActionCosts />

        {!user && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">🎁</div>
            <div className="font-medium text-[#F8FAFC] mb-1">5 free credits for every new account</div>
            <div className="text-sm text-[#94A3B8] mb-4">No card needed to get started.</div>
            <a href="/signup" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
              Create free account
            </a>
          </div>
        )}

      </div>

      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-8 text-center text-sm text-[#64748B]">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}
