export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">
            Influence<span className="text-purple-600">IQ</span>
          </span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">Find Influencers</a>
          <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 py-20 max-w-3xl mx-auto">
        <div className="inline-block bg-purple-50 text-purple-700 text-sm px-4 py-1 rounded-full mb-6">
          How it works
        </div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-6">
          From search to campaign in minutes
        </h1>
        <p className="text-gray-500 text-lg">
          InfluenceIQ is designed to be fast and simple. Here is exactly how it works for brands and influencers.
        </p>
      </section>

      {/* For brands */}
      <section className="bg-gray-50 px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">B</div>
            <h2 className="text-2xl font-semibold text-gray-900">For brands</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: "1", title: "Create a free account", desc: "Sign up in 30 seconds. You get 5 free credits instantly — no card needed.", icon: "👤" },
              { step: "2", title: "Search and filter influencers", desc: "Browse 12,400+ influencers. Filter by niche, platform, city, follower count, and AI score. Completely free.", icon: "🔍" },
              { step: "3", title: "Get an AI report", desc: "See deep analytics on any influencer — engagement breakdown, fake follower %, audience demographics, growth trend, and brand safety rating. Costs 3 credits.", icon: "⚡" },
              { step: "4", title: "Unlock contact details", desc: "When you find the right influencer, unlock their email and phone number. Costs 5 credits.", icon: "🔓" },
              { step: "5", title: "Send a campaign proposal", desc: "Write your campaign brief directly in the platform. The influencer receives it in their dashboard and can accept or decline. Costs 10 credits.", icon: "📩" },
              { step: "6", title: "Run your campaign", desc: "Coordinate directly with the influencer. Track results. Come back for the next one.", icon: "🚀" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5 bg-white rounded-xl p-5 border border-gray-100">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{item.icon}</span>
                    <span className="font-medium text-gray-900">{item.title}</span>
                  </div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For influencers */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center text-white text-sm font-medium">I</div>
            <h2 className="text-2xl font-semibold text-gray-900">For influencers</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: "1", title: "Submit your profile", desc: "Fill in a simple form with your platform, niche, follower count, and average rate. Takes 5 minutes. Completely free.", icon: "📝" },
              { step: "2", title: "Get AI scored", desc: "Our AI analyses your public profile and gives you a score from 0–100. Updated weekly as your account grows.", icon: "⚡" },
              { step: "3", title: "Get discovered", desc: "Brands search and find you based on your niche, score, and location. You do nothing — they come to you.", icon: "👀" },
              { step: "4", title: "Get the verified badge", desc: "Stand out with a verified badge. Verified profiles get 3x more brand views. Costs 20 credits — your one-time investment.", icon: "✓" },
              { step: "5", title: "Receive proposals", desc: "Brands send you campaign briefs directly. Review the brief, budget, and timeline. Accept or decline — you are always in control.", icon: "📩" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5 bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{item.icon}</span>
                    <span className="font-medium text-gray-900">{item.title}</span>
                  </div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-purple-600 px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Ready to get started?</h2>
        <p className="text-purple-200 mb-8">Create a free account and get 5 credits instantly.</p>
        <div className="flex justify-center gap-4">
          <a href="/signup" className="bg-white text-purple-600 px-8 py-3 rounded-lg text-sm font-medium hover:bg-purple-50">
            Create free account
          </a>
          <a href="/discover" className="border border-purple-400 text-white px-8 py-3 rounded-lg text-sm hover:bg-purple-500">
            Browse first
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