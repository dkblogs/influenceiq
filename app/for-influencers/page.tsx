"use client"
import Navbar from "@/app/components/Navbar"
import PlatformComparison from "@/app/components/PlatformComparison"

export default function ForInfluencersPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-600/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full text-xs text-cyan-300 mb-6">
            ⭐ For Creators & Influencers
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-5 leading-tight">
            Get Discovered. Collaborate.<br />
            <span className="text-cyan-400">Earn More.</span>
          </h1>
          <p className="text-[#94A3B8] text-lg mb-8 max-w-2xl mx-auto">
            Join India&apos;s smartest influencer marketplace — free to join, zero commission on every deal you close
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/signup?role=influencer"
              className="bg-cyan-600 text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Join as Creator →
            </a>
            <a
              href="/campaigns"
              className="bg-[#12121A] border border-[#1E1E2E] text-[#94A3B8] px-7 py-3.5 rounded-xl text-sm font-semibold hover:border-cyan-500/40 hover:text-[#F8FAFC] transition-colors"
            >
              Browse Campaigns
            </a>
          </div>
          <p className="text-xs text-[#64748B] mt-4">Free to join · No commission · Ever</p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-3">How It Works</h2>
          <p className="text-[#64748B] text-sm">From sign up to your first brand deal in 3 steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "✍️",
              step: "Step 1",
              title: "Create Profile",
              desc: "Set up your creator profile, add your niche and platforms, verify your Instagram or YouTube handle to build instant trust.",
            },
            {
              icon: "🤖",
              step: "Step 2",
              title: "Get AI Scored",
              desc: "Our AI analyses your engagement, audience quality, and content reliability to give you an InfluenceIQ score brands can trust.",
            },
            {
              icon: "💰",
              step: "Step 3",
              title: "Get Paid",
              desc: "Apply to open campaigns or receive direct proposals from brands. Negotiate terms, agree, and get paid — with zero commission taken.",
            },
          ].map(item => (
            <div key={item.title} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-xs text-cyan-400 font-medium mb-1">{item.step}</div>
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
            <p className="text-[#64748B] text-sm">Built for creators who want fair deals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: "💸", title: "0% Commission", desc: "Keep every single rupee. We never take a cut from your deals." },
              { icon: "🏅", title: "Verified Badge", desc: "Verified handle builds trust with brands and helps you stand out." },
              { icon: "🤖", title: "AI Score", desc: "Your InfluenceIQ score showcases your real value beyond follower count." },
              { icon: "📋", title: "Direct Negotiation", desc: "Brands propose directly to you. No middleman controlling the conversation." },
            ].map(item => (
              <div key={item.title} className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h4 className="text-[#F8FAFC] font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-[#64748B] text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <PlatformComparison
            heading="Stop losing money to agencies"
            subheading="See how much you save by working directly through InfluenceIQ"
          />
        </div>
      </section>

      {/* What you can do */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-3">Everything You Need</h2>
          <p className="text-[#64748B] text-sm">A full toolkit for serious creators</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: "📢", title: "Apply to Campaigns", desc: "Browse open brand campaigns and apply directly. See requirements, budgets, and deadlines upfront." },
            { icon: "💌", title: "Receive Brand Proposals", desc: "Brands can send you direct collaboration proposals. Review terms, counter-offer, and agree." },
            { icon: "🗂️", title: "Showcase Portfolio", desc: "Add your best campaigns and collaborations to your profile. Let your work speak for itself." },
            { icon: "✍️", title: "AI-Generated Bio", desc: "Get an AI-written profile bio based on your niche and verified social data." },
          ].map(item => (
            <div key={item.title} className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 flex gap-4">
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div>
                <h4 className="text-[#F8FAFC] font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-[#64748B] text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-600/8 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-3">Ready to get discovered?</h2>
          <p className="text-[#64748B] text-sm mb-7">Join hundreds of creators already on InfluenceIQ</p>
          <a
            href="/signup?role=influencer"
            className="inline-block bg-cyan-600 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Join Free →
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
        <a href="/for-brands" className="hover:text-[#94A3B8] transition-colors">For Brands →</a>
      </footer>
    </main>
  )
}
