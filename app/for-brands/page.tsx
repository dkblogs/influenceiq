"use client"
import Navbar from "@/app/components/Navbar"
import PlatformComparison from "@/app/components/PlatformComparison"

export default function ForBrandsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-xs text-purple-300 mb-6">
            🏢 For Brands & Businesses
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-5 leading-tight">
            Find Your Perfect Influencer.<br />
            <span className="text-purple-400">Pay Zero Commission.</span>
          </h1>
          <p className="text-[#94A3B8] text-lg mb-8 max-w-2xl mx-auto">
            InfluenceIQ connects brands with verified creators using AI — no middlemen, no hidden fees, no monthly subscriptions
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/signup?role=brand"
              className="bg-purple-600 text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
            >
              Get Started Free →
            </a>
            <a
              href="/discover/influencers"
              className="bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] px-7 py-3.5 rounded-xl text-sm font-semibold hover:border-purple-500/40 hover:text-[#F8FAFC] transition-colors"
            >
              Browse Influencers
            </a>
          </div>
          <p className="text-xs text-[#64748B] mt-4">5 free credits on sign up · No credit card needed</p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-3">How It Works</h2>
          <p className="text-[#64748B] text-sm">From discovery to collaboration in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔍",
              step: "Step 1",
              title: "Discover",
              desc: "Browse thousands of verified influencers by niche, platform, follower count, and location. Filter by Instagram, YouTube, LinkedIn and more.",
            },
            {
              icon: "🤝",
              step: "Step 2",
              title: "Connect",
              desc: "Unlock contact details, send direct proposals, and negotiate terms — all in one place. No agency in the middle.",
            },
            {
              icon: "🚀",
              step: "Step 3",
              title: "Collaborate",
              desc: "Run campaigns, review deliverables, track results, and rate influencers after collaboration. Build long-term relationships.",
            },
          ].map(item => (
            <div key={item.title} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-xs text-purple-400 font-medium mb-1">{item.step}</div>
              <h3 className="text-[#F8FAFC] font-semibold mb-2">{item.title}</h3>
              <p className="text-[#64748B] text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why InfluenceIQ */}
      <section className="px-4 py-16 bg-[#12121A]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-3">Why InfluenceIQ?</h2>
            <p className="text-[#64748B] text-sm">Everything you need, nothing you don&apos;t</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: "💸", title: "0% Commission", desc: "Others charge 10–30% per deal. We charge nothing." },
              { icon: "🤖", title: "AI-Powered Scoring", desc: "Every influencer is scored on engagement, audience quality, and niche authority." },
              { icon: "✅", title: "Verified Handles", desc: "Only influencers with verified social handles appear in search." },
              { icon: "📋", title: "Direct Proposals", desc: "Send proposals, negotiate terms, agree on deliverables — all in-app." },
            ].map(item => (
              <div key={item.title} className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h4 className="text-[#F8FAFC] font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-[#64748B] text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <PlatformComparison
            heading="See the difference"
            subheading="How InfluenceIQ compares to traditional influencer agencies"
          />
        </div>
      </section>

      {/* Pricing preview */}
      <section className="px-4 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-3">Simple Credit-Based Pricing</h2>
        <p className="text-[#64748B] text-sm mb-10">Start free. Buy credits only when you need them. No subscriptions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { credits: 5, price: "Free", label: "Starter", note: "On sign up", highlight: false },
            { credits: 50, price: "₹999", label: "Growth", note: "Most popular", highlight: true },
            { credits: 150, price: "₹2,499", label: "Pro", note: "Best value", highlight: false },
          ].map(pack => (
            <div
              key={pack.label}
              className={`rounded-2xl p-6 border ${pack.highlight ? "bg-purple-600/10 border-purple-500/40" : "bg-[#12121A] border-[#1E1E2E]"}`}
            >
              <div className={`text-xs font-medium mb-2 ${pack.highlight ? "text-purple-400" : "text-[#64748B]"}`}>{pack.note}</div>
              <div className="text-3xl font-bold text-[#F8FAFC] mb-1">{pack.credits}</div>
              <div className="text-[#64748B] text-xs mb-3">credits</div>
              <div className={`text-xl font-bold mb-4 ${pack.highlight ? "text-purple-400" : "text-[#F8FAFC]"}`}>{pack.price}</div>
              <div className="text-xs text-[#64748B]">{pack.label} plan</div>
            </div>
          ))}
        </div>
        <a href="/pricing" className="text-purple-400 text-sm hover:underline">View full pricing →</a>
      </section>

      {/* Market Insights */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 border border-purple-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-xs text-purple-300 mb-3">
              📊 New Feature
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F8FAFC] mb-2">Niche Trend Report</h2>
            <p className="text-[#94A3B8] text-sm max-w-md">
              AI-powered insights into India's influencer marketing landscape. See which niches are trending, engagement rates, best posting times and brand opportunities — updated daily.
            </p>
          </div>
          <a
            href="/niche-trends"
            className="flex-shrink-0 bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20 whitespace-nowrap"
          >
            View Market Trends →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-3">Ready to find your influencer?</h2>
          <p className="text-[#64748B] text-sm mb-7">Join hundreds of brands already using InfluenceIQ to grow</p>
          <a
            href="/signup?role=brand"
            className="inline-block bg-purple-600 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
          >
            Let's Go →
          </a>
          <p className="text-xs text-[#64748B] mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-purple-400 hover:underline">Log in</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] px-4 py-6 text-center text-xs text-[#64748B]">
        <a href="/" className="hover:text-[#94A3B8] transition-colors">← Back to home</a>
        <span className="mx-3">·</span>
        <a href="/for-influencers" className="hover:text-[#94A3B8] transition-colors">For Creators →</a>
      </footer>
    </main>
  )
}
