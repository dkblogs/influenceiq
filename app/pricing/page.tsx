"use client"
import { useState } from "react"

export default function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handlePayment(amount: number, credits: number, plan: string) {
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, credits, plan }),
    })
    const data = await res.json()

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "InfluenceIQ",
      description: `${plan} Plan — ${credits} credits`,
      order_id: data.orderId,
      handler: async function (response: any) {
        const session = await fetch("/api/auth/session")
        const sessionData = await session.json()
        const userId = sessionData?.user?.id

        if (userId) {
          const result = await fetch("/api/payment-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credits,
              plan,
              razorpay_payment_id: response.razorpay_payment_id,
              userId,
            }),
          })
          const resultData = await result.json()
          if (resultData.success) {
            alert(`Payment successful! You now have ${resultData.newCredits} credits.`)
            window.location.href = "/dashboard"
          }
        } else {
          alert(`Payment successful! Please log in to see your credits.`)
          window.location.href = "/login"
        }
      },
      prefill: { name: "", email: "" },
      theme: { color: "#7C3AED" },
    }

    const razor = new (window as any).Razorpay(options)
    razor.open()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <nav className="bg-white flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
        </a>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">Find Influencers</a>
          <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Get Started</a>
        </div>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-gray-600"></span>
          <span className="block w-5 h-0.5 bg-gray-600"></span>
          <span className="block w-5 h-0.5 bg-gray-600"></span>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <a href="/discover" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Influencers</a>
          <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center">Get Started</a>
        </div>
      )}

      <div className="px-4 md:px-8 py-12 md:py-16 max-w-5xl mx-auto">

        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Simple, pay-as-you-go pricing</h1>
          <p className="text-gray-500 text-base md:text-lg">One credit system for everyone — brands and influencers alike.</p>
          <div className="inline-block bg-green-50 text-green-700 text-sm px-4 py-1 rounded-full mt-4">
            Every new account gets 5 free credits — no card needed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-16">

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <div className="text-sm font-medium text-gray-500 mb-2">Starter</div>
            <div className="text-4xl font-semibold text-gray-900 mb-1">₹499</div>
            <div className="text-sm text-gray-400 mb-6">100 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>Unlock 20 influencer contacts</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>5 AI reports</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>10 collaboration requests</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>Post 6 open campaigns</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>50 campaign applications</li>
            </ul>
            <button onClick={() => handlePayment(499, 100, "Starter")} className="w-full border border-purple-600 text-purple-600 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-50">
              Buy Starter
            </button>
          </div>

          <div className="bg-purple-600 rounded-2xl p-6 md:p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs px-3 py-1 rounded-full font-medium">Most popular</div>
            <div className="text-sm font-medium text-purple-200 mb-2">Growth</div>
            <div className="text-4xl font-semibold text-white mb-1">₹1,499</div>
            <div className="text-sm text-purple-300 mb-6">400 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>Unlock 80 influencer contacts</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>20 AI reports</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>40 collaboration requests</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>Post 26 open campaigns</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>200 campaign applications</li>
              <li className="flex items-center gap-2 text-sm text-purple-100"><span className="text-purple-200">✓</span>Priority support</li>
            </ul>
            <button onClick={() => handlePayment(1499, 400, "Growth")} className="w-full bg-white text-purple-600 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-50">
              Buy Growth
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <div className="text-sm font-medium text-gray-500 mb-2">Agency</div>
            <div className="text-4xl font-semibold text-gray-900 mb-1">₹3,999</div>
            <div className="text-sm text-gray-400 mb-6">1,200 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>Unlock 240 influencer contacts</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>60 AI reports</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>120 collaboration requests</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>Post 80 open campaigns</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>600 campaign applications</li>
              <li className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>CSV export + API access</li>
            </ul>
            <button onClick={() => handlePayment(3999, 1200, "Agency")} className="w-full border border-purple-600 text-purple-600 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-50">
              Buy Agency
            </button>
          </div>

        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">What each action costs</h2>
          <p className="text-sm text-gray-400 mb-6">One credit system for both brands and influencers.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center text-xs font-medium text-blue-600">B</div>
                <span className="font-medium text-gray-900 text-sm">For Brands</span>
              </div>
              <div className="space-y-3">
                {[
                  ["Browse and search influencers", "Free"],
                  ["Unlock influencer contact details", "5 credits"],
                  ["Full AI scoring report", "3 credits"],
                  ["Send collaboration request", "10 credits"],
                  ["Post an open campaign", "15 credits"],
                ].map(([action, cost]) => (
                  <div key={action} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{action}</span>
                    <span className={`text-sm font-medium whitespace-nowrap ml-4 ${cost === "Free" ? "text-green-600" : "text-purple-600"}`}>{cost}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center text-xs font-medium text-purple-600">I</div>
                <span className="font-medium text-gray-900 text-sm">For Influencers</span>
              </div>
              <div className="space-y-3">
                {[
                  ["List your profile", "Free"],
                  ["Browse and discover brands", "Free"],
                  ["Receive collaboration requests", "Free"],
                  ["Send collaboration request to brand", "10 credits"],
                  ["See who viewed your profile", "5 credits"],
                  ["Apply to open brand campaign", "2 credits"],
                  ["Get verified badge", "20 credits"],
                ].map(([action, cost]) => (
                  <div key={action} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{action}</span>
                    <span className={`text-sm font-medium whitespace-nowrap ml-4 ${cost === "Free" ? "text-green-600" : "text-purple-600"}`}>{cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">🎁</div>
          <div className="font-medium text-gray-900 mb-1">5 free credits for every new account</div>
          <div className="text-sm text-gray-500 mb-4">No card needed to get started.</div>
          <a href="/signup" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700">
            Create free account
          </a>
        </div>

      </div>

      <footer className="border-t border-gray-100 px-4 md:px-8 py-8 text-center text-sm text-gray-400">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}
