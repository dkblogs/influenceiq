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