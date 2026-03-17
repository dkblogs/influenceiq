"use client"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

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

const influencers = [
  { name: "Priya Sharma", handle: "@priyaeats", niche: "Food", platform: "Instagram", followers: "84K", score: 91, initials: "PS", color: "bg-purple-500" },
  { name: "Rohit Kumar", handle: "@rohittech", niche: "Tech", platform: "YouTube", followers: "210K", score: 87, initials: "RK", color: "bg-orange-500" },
  { name: "Ananya Nair", handle: "@ananyafits", niche: "Fitness", platform: "Instagram", followers: "42K", score: 79, initials: "AN", color: "bg-green-500" },
  { name: "Vikram Mehta", handle: "@vikramfinance", niche: "Finance", platform: "LinkedIn", followers: "38K", score: 84, initials: "VM", color: "bg-yellow-500" },
  { name: "Sneha Patel", handle: "@snehastyle", niche: "Fashion", platform: "Instagram", followers: "95K", score: 88, initials: "SP", color: "bg-pink-500" },
  { name: "Arjun Das", handle: "@arjuntravels", niche: "Travel", platform: "YouTube", followers: "156K", score: 82, initials: "AD", color: "bg-blue-500" },
]

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
  const loggedIn = status !== "loading" && !!session
  const [aiDemo, setAiDemo] = useState(false)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
  }, [])

  return (
    <main className="min-h-screen bg-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">Influence<span className="text-purple-600">IQ</span></span>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">Find Influencers</a>
          <a href="/brands" className="text-sm text-gray-500 hover:text-gray-900">Find Brands</a>
          <a href="/campaigns" className="text-sm text-gray-500 hover:text-gray-900">Open Campaigns</a>
          <a href="/how-it-works" className="text-sm text-gray-500 hover:text-gray-900">How it works</a>
          <a href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</a>
          {loggedIn ? (
            <a href="/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Dashboard</a>
          ) : (
            <>
              <a href="/login" className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50">Log in</a>
              <a href="/signup" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Get started free</a>
            </>
          )}
        </div>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${mobileMenuOpen ? "opacity-0" : ""}`}></span>
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 py-4 flex flex-col gap-3 z-40">
          <a href="/discover" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Influencers</a>
          <a href="/brands" className="text-sm text-gray-600 py-2 border-b border-gray-50">Find Brands</a>
          <a href="/campaigns" className="text-sm text-gray-600 py-2 border-b border-gray-50">Open Campaigns</a>
          <a href="/how-it-works" className="text-sm text-gray-600 py-2 border-b border-gray-50">How it works</a>
          <a href="/pricing" className="text-sm text-gray-600 py-2 border-b border-gray-50">Pricing</a>
          <div className="flex gap-3 pt-2">
            {loggedIn ? (
              <a href="/dashboard" className="flex-1 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center hover:bg-purple-700">Dashboard</a>
            ) : (
              <>
                <a href="/login" className="flex-1 text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-center hover:bg-gray-50">Log in</a>
                <a href="/signup" className="flex-1 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg text-center hover:bg-purple-700">Get started</a>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={`text-center px-4 md:px-8 py-12 md:py-24 max-w-4xl mx-auto transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          India's first AI-scored influencer marketplace
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 leading-tight mb-6 tracking-tight">
          Find the right influencer.<br />
          <span className="text-purple-600">Powered by AI.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover, verify, and hire micro-influencers across Instagram, YouTube,
          Facebook, LinkedIn and X. Pay only for what you use.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
          <a href="/discover" className="bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-purple-700 transition-colors">
            Find Influencers — free
          </a>
          <a href="/join" className="border border-gray-200 text-gray-600 px-8 py-3 rounded-lg text-base hover:bg-gray-50 transition-colors">
            Join as Influencer
          </a>
        </div>
        <p className="text-sm text-gray-400">5 free credits on signup · No card needed · Cancel anytime</p>
      </section>

      {/* Brand logos */}
      <section className="border-y border-gray-100 py-8 px-4 md:px-8 overflow-hidden">
        <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-6">Trusted by brands across India</p>
        <div className="flex gap-6 md:gap-8 justify-center flex-wrap">
          {brands.map((brand) => (
            <div key={brand} className="text-sm font-medium text-gray-300 hover:text-gray-500 transition-colors cursor-default">
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* Live stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 md:px-8 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-semibold text-gray-900 mb-1">
            <CountUp target={12400} suffix="+" />
          </div>
          <div className="text-sm text-gray-400">Influencers listed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-semibold text-purple-600 mb-1">
            <CountUp target={8920} />
          </div>
          <div className="text-sm text-gray-400">AI verified</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-semibold text-gray-900 mb-1">
            <CountUp target={340} suffix="+" />
          </div>
          <div className="text-sm text-gray-400">Niches covered</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-semibold text-gray-900 mb-1">
            <CountUp target={5} />
          </div>
          <div className="text-sm text-gray-400">Platforms</div>
        </div>
      </section>

      {/* Featured influencers */}
      <section className="bg-gray-50 px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Featured influencers</h2>
              <p className="text-gray-500 text-sm mt-1">Top AI-scored creators ready for brand partnerships</p>
            </div>
            <a href="/discover" className="text-sm text-purple-600 font-medium hover:underline whitespace-nowrap ml-4">View all →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((inf) => (
              <div key={inf.handle} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${inf.color} flex items-center justify-center text-white text-sm font-medium`}>
                      {inf.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {loggedIn ? inf.name : firstName(inf.name)}
                      </div>
                      {loggedIn ? (
                        <div className="text-xs text-gray-400">{inf.handle}</div>
                      ) : (
                        <div className="text-xs text-gray-300 select-none blur-sm">{inf.handle}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    {loggedIn ? (
                      <>
                        <div className="text-lg font-semibold text-purple-600">{inf.score}</div>
                        <div className="text-xs text-gray-400">AI Score</div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg text-gray-300">🔒</div>
                        <div className="text-xs text-gray-400">AI Score</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{inf.niche}</span>
                  <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{inf.platform}</span>
                  {loggedIn ? (
                    <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{inf.followers}</span>
                  ) : (
                    <span className="text-xs bg-gray-50 text-gray-300 px-2 py-0.5 rounded-full blur-sm select-none">{inf.followers}</span>
                  )}
                </div>
                {!loggedIn && (
                  <div className="text-xs text-center text-gray-400 mb-2">
                    🔒 <a href="/login" className="text-purple-600 hover:underline">Sign in to see full details</a>
                  </div>
                )}
                <a href={loggedIn ? "/discover" : "/login"} className="block w-full text-center bg-purple-50 text-purple-700 py-2 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">
                  {loggedIn ? "View profile →" : "Sign in to view →"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Score Demo */}
      <section className="px-4 md:px-8 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-block bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full mb-4">AI Scoring Engine</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Every influencer scored on 6 real signals</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Our AI analyses every influencer's public data weekly. No guessing. No fake metrics. Just honest scores based on what actually matters for brand campaigns.
            </p>
            <button
              onClick={() => setAiDemo(!aiDemo)}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              {aiDemo ? "Hide demo" : "See a live score breakdown →"}
            </button>
          </div>
          <div className={`transition-all duration-500 ${aiDemo ? "opacity-100" : "opacity-40"}`}>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">PS</div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Priya Sharma</div>
                    <div className="text-xs text-gray-400">@priyaeats · Food · Instagram</div>
                  </div>
                </div>
                <div className="text-3xl font-semibold text-purple-600">91</div>
              </div>
              <div className="space-y-3">
                {scoreFactors.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{f.label}</span>
                      <span className="font-medium text-purple-600">{f.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: aiDemo ? `${f.value}%` : "0%" }}
                      ></div>
                    </div>
                    {aiDemo && <div className="text-xs text-gray-400 mt-0.5">{f.desc}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">What people are saying</h2>
          <p className="text-gray-500 text-center text-sm mb-10">From brands and influencers across India</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-medium`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.role}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === "Brand" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                    {t.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 md:px-8 py-12 md:py-16 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Stay in the loop</h2>
        <p className="text-gray-500 text-sm mb-6">Get influencer marketing tips, platform updates, and new creator spotlights. No spam.</p>
        {subscribed ? (
          <div className="bg-green-50 text-green-700 px-6 py-3 rounded-lg text-sm font-medium">
            You are subscribed! We will be in touch.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="you@example.com"
            />
            <button
              onClick={() => { if (email) setSubscribed(true) }}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 md:px-8 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <span className="font-semibold">Influence<span className="text-purple-600">IQ</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">India's first AI-scored influencer marketplace.</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-3">Platform</div>
            <div className="space-y-2">
              <a href="/discover" className="block text-sm text-gray-400 hover:text-gray-600">Find Influencers</a>
              <a href="/brands" className="block text-sm text-gray-400 hover:text-gray-600">Find Brands</a>
              <a href="/campaigns" className="block text-sm text-gray-400 hover:text-gray-600">Open Campaigns</a>
              <a href="/join" className="block text-sm text-gray-400 hover:text-gray-600">Join as Influencer</a>
              <a href="/pricing" className="block text-sm text-gray-400 hover:text-gray-600">Pricing</a>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-3">Company</div>
            <div className="space-y-2">
              <a href="/about" className="block text-sm text-gray-400 hover:text-gray-600">About Us</a>
              <a href="/why" className="block text-sm text-gray-400 hover:text-gray-600">Why InfluenceIQ</a>
              <a href="/how-it-works" className="block text-sm text-gray-400 hover:text-gray-600">How It Works</a>
              <a href="/contact" className="block text-sm text-gray-400 hover:text-gray-600">Contact Us</a>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-3">Legal</div>
            <div className="space-y-2">
              <a href="/privacy" className="block text-sm text-gray-400 hover:text-gray-600">Privacy Policy</a>
              <a href="/terms" className="block text-sm text-gray-400 hover:text-gray-600">Terms of Service</a>
              <a href="/faq" className="block text-sm text-gray-400 hover:text-gray-600">FAQ</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
          © 2025 InfluenceIQ · India's AI Influencer Marketplace
        </div>
      </footer>

    </main>
  )
}
