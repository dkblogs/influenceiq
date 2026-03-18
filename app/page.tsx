"use client"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Navbar from "@/app/components/Navbar"

function firstName(name: string) {
  return name?.split(" ")[0] || name
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const duration = 2000
        const step = target / (duration / 16)
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const colorMap: Record<string, string> = {
  PS: "bg-purple-500", RK: "bg-orange-500", AN: "bg-green-500",
  VM: "bg-yellow-500", SP: "bg-pink-500", AD: "bg-blue-500",
  MI: "bg-red-500", KS: "bg-indigo-500", DR: "bg-teal-500",
}

function getInitials(name: string) {
  const parts = name?.trim().split(" ")
  return parts?.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (name?.slice(0, 2).toUpperCase() || "??")
}

function getColor(initials: string) {
  return colorMap[initials] || "bg-gray-500"
}

const testimonials = [
  { name: "Ravi Gupta", role: "Marketing Head, FreshKart", type: "Brand", text: "We wasted months trying to find genuine food influencers. InfluenceIQ found us 8 verified creators in 20 minutes. The AI score saved us from three accounts with fake followers.", avatar: "RG", color: "bg-orange-500" },
  { name: "Priya Sharma", role: "Food Creator, Mumbai", type: "Influencer", text: "Within a week of listing on InfluenceIQ I got 4 brand proposals. The verified badge made a huge difference. Brands trust you immediately when they see that score.", avatar: "PS", color: "bg-purple-500" },
  { name: "Kiran Patel", role: "Founder, ZenFit App", type: "Brand", text: "The AI report is genuinely impressive. It showed us exactly which fitness influencers had real engaged audiences. Our campaign ROI improved by 3x compared to last year.", avatar: "KP", color: "bg-green-500" },
  { name: "Rohit Kumar", role: "Tech Creator, Bangalore", type: "Influencer", text: "I had been posting for 2 years with no brand deals. One month on InfluenceIQ and I had my first paid campaign. The platform does the hard work for you.", avatar: "RK", color: "bg-blue-500" },
]

const brands = ["FreshKart", "ZenFit", "PayEasy", "StyleHub", "TechNova", "HealthPlus", "EduLearn", "FoodBox"]

const scoreFactors = [
  { label: "Engagement rate", value: 91, desc: "6.2% avg — top 5% in Food niche" },
  { label: "Fake follower detection", value: 96, desc: "Only 2.1% suspicious accounts" },
  { label: "Content consistency", value: 85, desc: "Posts 4-5x per week regularly" },
  { label: "Audience quality", value: 88, desc: "78% Indian audience, active commenters" },
  { label: "Niche authority", value: 92, desc: "Ranked #3 food creator in Mumbai" },
  { label: "Growth trend", value: 79, desc: "+2,400 followers in last 30 days" },
]

export default function Home() {
  const { data: session, status } = useSession()
  console.log("Session status:", status, "User:", session?.user?.email, "Role:", (session?.user as any)?.role)
  const loggedIn = status !== "loading" && !!session
  const user = session?.user as any
  const role = user?.role
  const [aiDemo, setAiDemo] = useState(false)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const [featuredInfluencers, setFeaturedInfluencers] = useState<any[]>([])

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
  }, [])

  useEffect(() => {
    fetch('/api/influencers')
      .then(res => res.json())
      .then(data => setFeaturedInfluencers((data.influencers || []).slice(0, 6)))
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0F]">

      <Navbar />

      {/* Hero */}
      <section className={`relative text-center px-4 md:px-8 py-12 md:py-24 max-w-4xl mx-auto transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E1E2E_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-transparent to-[#0A0A0F] pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 text-sm px-4 py-1.5 rounded-full mb-6 border border-purple-500/20">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            India's first AI-scored influencer marketplace
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] leading-tight mb-6">
            Find the right influencer.<br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Powered by AI.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover, verify, and hire micro-influencers across Instagram, YouTube,
            Facebook, LinkedIn and X. Pay only for what you use.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
            {!loggedIn && (
              <>
                <a href="/discover" className="bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/25">
                  Find Influencers — free
                </a>
                <a href="/join" className="border border-[#1E1E2E] text-[#94A3B8] px-8 py-3 rounded-lg text-base hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors">
                  Join as Influencer
                </a>
              </>
            )}
            {loggedIn && role === "brand" && (
              <>
                <a href="/discover" className="bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/25">
                  Find Influencers
                </a>
                <a href="/post-campaign" className="border border-[#1E1E2E] text-[#94A3B8] px-8 py-3 rounded-lg text-base hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors">
                  Post a Campaign
                </a>
              </>
            )}
            {loggedIn && role !== "brand" && (
              <>
                <a href="/brands" className="bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/25">
                  Browse Brands
                </a>
                <a href="/campaigns" className="border border-[#1E1E2E] text-[#94A3B8] px-8 py-3 rounded-lg text-base hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors">
                  View Campaigns
                </a>
              </>
            )}
          </div>
          {!loggedIn && <p className="text-sm text-[#64748B]">5 free credits on signup · No card needed · Cancel anytime</p>}
        </div>
      </section>

      {/* Brand logos */}
      <section className="border-y border-[#1E1E2E] py-8 px-4 md:px-8 overflow-hidden">
        <p className="text-center text-xs text-[#64748B] uppercase tracking-widest mb-6">Trusted by brands across India</p>
        <div className="flex gap-6 md:gap-8 justify-center flex-wrap">
          {brands.map((brand) => (
            <div key={brand} className="text-sm font-medium text-[#334155] hover:text-[#94A3B8] transition-colors cursor-default">
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* Live stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-8 py-10 md:py-16 max-w-4xl mx-auto">
        <div className="text-center px-2">
          <div className="text-2xl md:text-4xl font-bold text-[#F8FAFC] mb-1">
            <CountUp target={12400} suffix="+" />
          </div>
          <div className="text-xs md:text-sm text-[#94A3B8]">Influencers listed</div>
        </div>
        <div className="text-center px-2">
          <div className="text-2xl md:text-4xl font-bold text-purple-400 mb-1">
            <CountUp target={8920} />
          </div>
          <div className="text-xs md:text-sm text-[#94A3B8]">AI verified</div>
        </div>
        <div className="text-center px-2">
          <div className="text-2xl md:text-4xl font-bold text-[#F8FAFC] mb-1">
            <CountUp target={340} suffix="+" />
          </div>
          <div className="text-xs md:text-sm text-[#94A3B8]">Niches covered</div>
        </div>
        <div className="text-center px-2">
          <div className="text-2xl md:text-4xl font-bold text-[#F8FAFC] mb-1">
            <CountUp target={5} />
          </div>
          <div className="text-xs md:text-sm text-[#94A3B8]">Platforms</div>
        </div>
      </section>

      {/* Featured influencers */}
      <section className="bg-[#0D0D1A] px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Featured influencers</h2>
              <p className="text-[#94A3B8] text-sm mt-1">Top AI-scored creators ready for brand partnerships</p>
            </div>
            <a href="/discover" className="text-sm text-purple-400 font-medium hover:underline whitespace-nowrap ml-4">View all →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredInfluencers.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1E1E2E]" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 bg-[#1E1E2E] rounded" />
                          <div className="h-2.5 w-16 bg-[#1E1E2E] rounded" />
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="h-5 w-8 bg-[#1E1E2E] rounded" />
                        <div className="h-2.5 w-12 bg-[#1E1E2E] rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 w-14 bg-[#1E1E2E] rounded-full" />
                      <div className="h-5 w-16 bg-[#1E1E2E] rounded-full" />
                      <div className="h-5 w-10 bg-[#1E1E2E] rounded-full" />
                    </div>
                    <div className="h-8 bg-[#1E1E2E] rounded-lg" />
                  </div>
                ))
              : featuredInfluencers.map((inf) => {
                  const initials = getInitials(inf.name)
                  const color = getColor(initials)
                  return (
                    <div key={inf.id} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-5 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => window.location.href = `/influencer/${inf.id}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-medium`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-[#F8FAFC] text-sm">
                              {loggedIn ? inf.name : firstName(inf.name)}
                            </div>
                            {loggedIn ? (
                              <div className="text-xs text-[#64748B]">{inf.handle}</div>
                            ) : (
                              <div className="text-xs text-[#334155] select-none blur-sm">{inf.handle}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          {loggedIn ? (
                            <>
                              <div className="text-lg font-semibold text-purple-400">{inf.score}</div>
                              <div className="text-xs text-[#64748B]">AI Score</div>
                            </>
                          ) : (
                            <>
                              <div className="text-lg text-[#334155]">🔒</div>
                              <div className="text-xs text-[#64748B]">AI Score</div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{inf.niche}</span>
                        <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{inf.platform}</span>
                        {loggedIn ? (
                          <span className="text-xs bg-[#1E1E2E] text-[#94A3B8] px-2 py-0.5 rounded-full">{inf.followers}</span>
                        ) : (
                          <span className="text-xs bg-[#1E1E2E] text-[#334155] px-2 py-0.5 rounded-full blur-sm select-none">{inf.followers}</span>
                        )}
                      </div>
                      {!loggedIn && (
                        <div className="text-xs text-center text-[#64748B] mb-2">
                          🔒 <a href="/login" className="text-purple-400 hover:underline">Sign in to see full details</a>
                        </div>
                      )}
                      <a href={loggedIn ? `/influencer/${inf.id}` : "/login"} className="block w-full text-center bg-purple-500/10 text-purple-400 py-2 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                        {loggedIn ? "View profile →" : "Sign in to view →"}
                      </a>
                    </div>
                  )
                })
            }
          </div>
        </div>
      </section>

      {/* AI Score Demo */}
      <section className="px-4 md:px-8 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-block bg-purple-500/10 text-purple-400 text-xs px-3 py-1 rounded-full mb-4 border border-purple-500/20">AI Scoring Engine</div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC] mb-4">Every influencer scored on 6 real signals</h2>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
              Our AI analyses every influencer's public data weekly. No guessing. No fake metrics. Just honest scores based on what actually matters for brand campaigns.
            </p>
            <button
              onClick={() => setAiDemo(!aiDemo)}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/25"
            >
              {aiDemo ? "Hide demo" : "See a live score breakdown →"}
            </button>
          </div>
          <div className={`transition-all duration-500 ${aiDemo ? "opacity-100" : "opacity-30"}`}>
            <div className="bg-[#12121A] rounded-2xl p-6 border border-[#1E1E2E]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">PS</div>
                  <div>
                    <div className="font-medium text-[#F8FAFC] text-sm">Priya Sharma</div>
                    <div className="text-xs text-[#64748B]">@priyaeats · Food · Instagram</div>
                  </div>
                </div>
                <div className="text-3xl font-semibold text-purple-400">91</div>
              </div>
              <div className="space-y-3">
                {scoreFactors.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#94A3B8]">{f.label}</span>
                      <span className="font-medium text-purple-400">{f.value}</span>
                    </div>
                    <div className="h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: aiDemo ? `${f.value}%` : "0%" }}
                      ></div>
                    </div>
                    {aiDemo && <div className="text-xs text-[#64748B] mt-0.5">{f.desc}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0D0D1A] px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC] text-center mb-2">What people are saying</h2>
          <p className="text-[#94A3B8] text-center text-sm mb-10">From brands and influencers across India</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#12121A] rounded-2xl border border-[#1E1E2E] p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-medium`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-[#F8FAFC] text-sm">{t.name}</div>
                      <div className="text-xs text-[#64748B]">{t.role}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === "Brand" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                    {t.type}
                  </span>
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 md:px-8 py-12 md:py-16 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC] mb-2">Stay in the loop</h2>
        <p className="text-[#94A3B8] text-sm mb-6">Get influencer marketing tips, platform updates, and new creator spotlights. No spam.</p>
        {subscribed ? (
          <div className="bg-[#10B981]/10 text-[#10B981] px-6 py-3 rounded-lg text-sm font-medium border border-[#10B981]/20">
            You are subscribed! We will be in touch.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-[#1E1E2E] rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-[#12121A] text-[#F8FAFC] placeholder-[#64748B]"
              placeholder="you@example.com"
            />
            <button
              onClick={() => { if (email) setSubscribed(true) }}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors whitespace-nowrap shadow-lg shadow-purple-500/20"
            >
              Subscribe
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] px-4 md:px-8 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <span className="font-semibold text-[#F8FAFC]">Influence<span className="text-purple-400">IQ</span></span>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed">India's first AI-scored influencer marketplace.</p>
          </div>
          <div>
            <div className="text-sm font-medium text-[#F8FAFC] mb-3">Platform</div>
            <div className="space-y-2">
              <a href="/discover" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Find Influencers</a>
              <a href="/brands" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Find Brands</a>
              <a href="/campaigns" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Open Campaigns</a>
              <a href="/leaderboard" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Leaderboard</a>
              <a href="/join" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Join as Influencer</a>
              <a href="/pricing" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Pricing</a>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#F8FAFC] mb-3">Company</div>
            <div className="space-y-2">
              <a href="/about" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">About Us</a>
              <a href="/why" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Why InfluenceIQ</a>
              <a href="/how-it-works" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">How It Works</a>
              <a href="/contact" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Contact Us</a>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#F8FAFC] mb-3">Legal</div>
            <div className="space-y-2">
              <a href="/privacy" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Privacy Policy</a>
              <a href="/terms" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">Terms of Service</a>
              <a href="/faq" className="block text-sm text-[#64748B] hover:text-[#94A3B8]">FAQ</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#1E1E2E] pt-6 text-center text-sm text-[#64748B]">
          © 2025 InfluenceIQ · India's AI Influencer Marketplace
        </div>
      </footer>

    </main>
  )
}
