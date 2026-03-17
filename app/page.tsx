export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold">
            Influence<span className="text-purple-600">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/discover" className="text-sm text-gray-500 hover:text-gray-900">Find Influencers</a>
          <a href="/join" className="text-sm text-gray-500 hover:text-gray-900">For Influencers</a>
          <a href="/login" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Get Started</a>
        </div>
      </nav>

      <section className="text-center px-8 py-24 max-w-4xl mx-auto">
        <div className="inline-block bg-purple-50 text-purple-700 text-sm px-4 py-1 rounded-full mb-6">
          India's first AI-scored influencer marketplace
        </div>
        <h1 className="text-5xl font-semibold text-gray-900 leading-tight mb-6">
          Find the right influencer.<br />
          <span className="text-purple-600">Powered by AI.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Discover, verify, and hire micro-influencers across Instagram, YouTube, Facebook, LinkedIn and X. Pay only for what you use.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/discover" className="bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-purple-700">Find Influencers</a>
          <a href="/join" className="border border-gray-200 text-gray-600 px-8 py-3 rounded-lg text-base hover:bg-gray-50">Join as Influencer</a>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-6 px-8 py-12 max-w-4xl mx-auto border-t border-gray-100">
        <div className="text-center">
          <div className="text-3xl font-semibold text-gray-900">12,400+</div>
          <div className="text-sm text-gray-500 mt-1">Influencers listed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-purple-600">8,920</div>
          <div className="text-sm text-gray-500 mt-1">AI verified</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-gray-900">340</div>
          <div className="text-sm text-gray-500 mt-1">Niches covered</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-gray-900">5</div>
          <div className="text-sm text-gray-500 mt-1">Platforms</div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 px-8">
        <p className="text-center text-sm text-gray-400 mb-6">Influencers across all major platforms</p>
        <div className="flex justify-center gap-8 text-gray-400 text-sm">
          <span>📸 Instagram</span>
          <span>▶ YouTube</span>
          <span>f Facebook</span>
          <span>in LinkedIn</span>
          <span>✕ X / Twitter</span>
        </div>
      </section>

      <section className="px-8 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-12">How it works</h2>
        <div className="grid grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">🔍</div>
            <h3 className="font-medium text-gray-900 mb-2">Search</h3>
            <p className="text-sm text-gray-500">Filter by niche, platform, follower count, and location. Free to browse.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">⚡</div>
            <h3 className="font-medium text-gray-900 mb-2">AI Score</h3>
            <p className="text-sm text-gray-500">Every influencer is scored by AI on engagement, authenticity, and niche authority.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">🤝</div>
            <h3 className="font-medium text-gray-900 mb-2">Connect</h3>
            <p className="text-sm text-gray-500">Unlock contact details or send a campaign proposal directly. Pay per action.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <span className="font-semibold">Influence<span className="text-purple-600">IQ</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's first AI-scored influencer marketplace.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-3">Platform</div>
            <div className="space-y-2">
              <a href="/discover" className="block text-sm text-gray-400 hover:text-gray-600">Find Influencers</a>
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