import Navbar from "@/app/components/Navbar"
import PlatformComparison from "@/app/components/PlatformComparison"

export default function About() {
  return (
    <main className="min-h-screen bg-white">

      <Navbar />

      {/* Hero */}
      <section className="text-center px-8 py-20 max-w-3xl mx-auto">
        <div className="inline-block bg-purple-50 text-purple-700 text-sm px-4 py-1 rounded-full mb-6">
          About InfluenceIQ
        </div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-6">
          We are building India's most trusted influencer marketplace
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          InfluenceIQ was built to solve a real problem — brands wasting money on influencers
          with fake followers, and genuine creators struggling to get discovered. We use AI to
          bring transparency, trust, and efficiency to influencer marketing in India.
        </p>
      </section>

      {/* Zero Commission Hero Card */}
      <section className="px-8 pb-12">
        <div className="max-w-4xl mx-auto relative rounded-2xl bg-[#0A0A0F] p-8 md:p-10"
          style={{ boxShadow: "0 0 0 1.5px #7c3aed, 0 0 40px 0 #7c3aed33, 0 0 80px 0 #22c55e18" }}>
          {/* Pulsing badge */}
          <span className="absolute top-5 right-5 flex items-center gap-1.5 bg-green-500/10 border border-green-500/40 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            NO COMMISSION
          </span>
          <div className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            0% Commission. <span className="text-green-400">Always.</span>
          </div>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl">
            While other platforms take 10%–30% of every deal, InfluenceIQ charges nothing. Zero. Keep every rupee you earn or save.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
              <div className="text-xl mb-2">💰</div>
              <div className="text-sm text-red-300 font-medium">Other platforms</div>
              <div className="text-xs text-gray-400 mt-1">Take ₹10,000–₹30,000 on every ₹1L deal</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4">
              <div className="text-xl mb-2">✅</div>
              <div className="text-sm text-green-300 font-medium">InfluenceIQ</div>
              <div className="text-xs text-gray-400 mt-1">₹0 commission on every deal, forever</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-5 py-4">
              <div className="text-xl mb-2">📈</div>
              <div className="text-sm text-purple-300 font-medium">You save</div>
              <div className="text-xs text-gray-400 mt-1">Up to 30% more per campaign — reinvest it in growth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gray-50 px-8 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our mission</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              India has over 100 million content creators. Most of them are genuine, 
              hardworking people building real audiences. Yet brands struggle to find 
              them — and end up paying for followers that don't exist.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Our mission is to make influencer marketing honest. Every influencer on 
              InfluenceIQ is scored by our AI on real signals — engagement rate, audience 
              quality, content consistency, and fake follower detection. No more guessing.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium text-gray-900 mb-1">Transparency first</div>
              <div className="text-sm text-gray-500">Every score, every metric, every data point is explained clearly.</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="text-2xl mb-2">🤝</div>
              <div className="font-medium text-gray-900 mb-1">Fair for creators</div>
              <div className="text-sm text-gray-500">Influencers list for free. We never take a commission on deals.</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="text-2xl mb-2">🇮🇳</div>
              <div className="font-medium text-gray-900 mb-1">Built for India</div>
              <div className="text-sm text-gray-500">Priced in rupees, focused on Indian creators and brands.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">By the numbers</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-semibold text-purple-600 mb-2">12,400+</div>
            <div className="text-sm text-gray-500">Influencers listed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-semibold text-purple-600 mb-2">340+</div>
            <div className="text-sm text-gray-500">Niches covered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-semibold text-purple-600 mb-2">5</div>
            <div className="text-sm text-gray-500">Platforms supported</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-semibold text-purple-600 mb-2">100%</div>
            <div className="text-sm text-gray-500">AI verified scores</div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-purple-600 px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-10">What we believe</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-purple-500 rounded-xl p-6">
              <div className="text-2xl mb-3">✨</div>
              <div className="font-medium text-white mb-2">Authentic always wins</div>
              <div className="text-sm text-purple-200">Real engagement beats vanity metrics every time.</div>
            </div>
            <div className="bg-purple-500 rounded-xl p-6">
              <div className="text-2xl mb-3">💡</div>
              <div className="font-medium text-white mb-2">Data over gut feel</div>
              <div className="text-sm text-purple-200">Every decision should be backed by real numbers.</div>
            </div>
            <div className="bg-purple-500 rounded-xl p-6">
              <div className="text-2xl mb-3">🚀</div>
              <div className="font-medium text-white mb-2">Creators deserve better</div>
              <div className="text-sm text-purple-200">The right tools can transform a creator's career.</div>
            </div>
          </div>
        </div>
      </section>

      <PlatformComparison
        heading="The InfluenceIQ Difference"
        subheading="See exactly how much you save compared to other platforms."
      />

      {/* CTA */}
      <section className="px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to get started?</h2>
        <p className="text-gray-500 mb-8">Join thousands of brands and influencers already on InfluenceIQ.</p>
        <div className="flex justify-center gap-4">
          <a href="/discover" className="bg-purple-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-purple-700">
            Find Influencers
          </a>
          <a href="/join" className="border border-gray-200 text-gray-600 px-8 py-3 rounded-lg text-sm hover:bg-gray-50">
            Join as Influencer
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8 text-center text-sm text-gray-400">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}