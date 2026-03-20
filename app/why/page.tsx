import Navbar from "@/app/components/Navbar"
import PlatformComparison from "@/app/components/PlatformComparison"

export default function Why() {
  return (
    <main className="min-h-screen bg-white">

      <Navbar />

      {/* Hero */}
      <section className="text-center px-8 py-20 max-w-3xl mx-auto">
        <div className="inline-block bg-purple-50 text-purple-700 text-sm px-4 py-1 rounded-full mb-6">
          Why InfluenceIQ
        </div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-6">
          Why brands choose InfluenceIQ over everything else
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          There are other ways to find influencers. Here is why InfluenceIQ is different — and why it matters for your brand.
        </p>
      </section>

      {/* Problem */}
      <section className="bg-red-50 px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
            The problem with influencer marketing today
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-red-100">
              <div className="text-2xl mb-3">😤</div>
              <div className="font-medium text-gray-900 mb-2">Fake followers everywhere</div>
              <div className="text-sm text-gray-500">Up to 40% of followers on some accounts are bots or inactive. Brands pay for reach that does not exist.</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-red-100">
              <div className="text-2xl mb-3">🕵️</div>
              <div className="font-medium text-gray-900 mb-2">No way to verify</div>
              <div className="text-sm text-gray-500">Most platforms just show follower counts. There is no way to know if those followers are real or engaged.</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-red-100">
              <div className="text-2xl mb-3">💸</div>
              <div className="font-medium text-gray-900 mb-2">Wasted budgets</div>
              <div className="text-sm text-gray-500">Indian brands waste crores every year on influencer campaigns that deliver zero real results.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
          How InfluenceIQ solves this
        </h2>
        <div className="space-y-6">
          <div className="flex items-start gap-6 p-6 border border-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⚡</div>
            <div>
              <div className="font-medium text-gray-900 mb-2">AI scoring on every profile</div>
              <div className="text-sm text-gray-500 leading-relaxed">Every influencer gets an AI score from 0–100 based on 6 real signals — engagement rate, fake follower percentage, content consistency, audience quality, niche authority, and growth trend. Updated weekly.</div>
            </div>
          </div>
          <div className="flex items-start gap-6 p-6 border border-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔍</div>
            <div>
              <div className="font-medium text-gray-900 mb-2">Filter by what actually matters</div>
              <div className="text-sm text-gray-500 leading-relaxed">Search by niche, platform, city, follower range, engagement rate, and AI score. Find exactly the right influencer for your campaign in minutes — not days.</div>
            </div>
          </div>
          <div className="flex items-start gap-6 p-6 border border-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💳</div>
            <div>
              <div className="font-medium text-gray-900 mb-2">Pay only for what you use</div>
              <div className="text-sm text-gray-500 leading-relaxed">No monthly subscription. No hidden fees. Browse free. Pay credits only when you unlock a contact, get an AI report, or send a proposal. Credits never expire.</div>
            </div>
          </div>
          <div className="flex items-start gap-6 p-6 border border-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🇮🇳</div>
            <div>
              <div className="font-medium text-gray-900 mb-2">Built specifically for India</div>
              <div className="text-sm text-gray-500 leading-relaxed">Priced in rupees. Focused on Indian creators across all regions and languages. Supports UPI payments. Understands Indian niches like regional food, Bollywood, cricket, and more.</div>
            </div>
          </div>
        </div>
      </section>

      <PlatformComparison
        heading="Why We're Different"
        subheading="No commissions. No hidden fees. Ever."
      />

      {/* Comparison */}
      <section className="bg-gray-50 px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
            InfluenceIQ vs other options
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-medium text-gray-500">Feature</th>
                  <th className="px-6 py-4 font-medium text-purple-600">InfluenceIQ</th>
                  <th className="px-6 py-4 font-medium text-gray-400">Manual search</th>
                  <th className="px-6 py-4 font-medium text-gray-400">Other platforms</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI fake follower detection", "✓", "✗", "Rarely"],
                  ["AI engagement scoring", "✓", "✗", "✗"],
                  ["India-focused", "✓", "✓", "✗"],
                  ["Pay per use — no subscription", "✓", "Free", "✗"],
                  ["Direct proposal system", "✓", "Manual", "Sometimes"],
                  ["UPI payment support", "✓", "N/A", "✗"],
                  ["Free to browse", "✓", "✓", "✗"],
                ].map(([feature, iq, manual, other], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-3 text-gray-700">{feature}</td>
                    <td className="px-6 py-3 text-center text-green-600 font-medium">{iq}</td>
                    <td className="px-6 py-3 text-center text-gray-400">{manual}</td>
                    <td className="px-6 py-3 text-center text-gray-400">{other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">See it for yourself</h2>
        <p className="text-gray-500 mb-8">Browse influencers for free. No account needed to search.</p>
        <div className="flex justify-center gap-4">
          <a href="/discover" className="bg-purple-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-purple-700">
            Browse Influencers
          </a>
          <a href="/pricing" className="border border-gray-200 text-gray-600 px-8 py-3 rounded-lg text-sm hover:bg-gray-50">
            See Pricing
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