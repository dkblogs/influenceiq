export default function Pricing() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navigation */}
      <nav className="bg-white flex items-center justify-between px-8 py-4 border-b border-gray-100">
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

      <div className="px-8 py-16 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Simple, pay-as-you-go pricing
          </h1>
          <p className="text-gray-500 text-lg">
            Buy credits once. Use them whenever. They never expire.
          </p>
          <div className="inline-block bg-green-50 text-green-700 text-sm px-4 py-1 rounded-full mt-4">
            Every new account gets 5 free credits — no card needed
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-3 gap-6 mb-16">

          {/* Starter */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="text-sm font-medium text-gray-500 mb-2">Starter</div>
            <div className="text-4xl font-semibold text-gray-900 mb-1">₹499</div>
            <div className="text-sm text-gray-400 mb-6">100 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Unlock 20 influencer contacts
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Get 5 full AI reports
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Send 10 proposals
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Browse all influencers free
              </li>
            </ul>
            <button className="w-full border border-purple-600 text-purple-600 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-50">
              Buy Starter
            </button>
          </div>

          {/* Growth - highlighted */}
          <div className="bg-purple-600 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs px-3 py-1 rounded-full font-medium">
              Most popular
            </div>
            <div className="text-sm font-medium text-purple-200 mb-2">Growth</div>
            <div className="text-4xl font-semibold text-white mb-1">₹1,499</div>
            <div className="text-sm text-purple-300 mb-6">400 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-purple-100">
                <span className="text-purple-200">✓</span> Unlock 80 influencer contacts
              </li>
              <li className="flex items-center gap-2 text-sm text-purple-100">
                <span className="text-purple-200">✓</span> Get 20 full AI reports
              </li>
              <li className="flex items-center gap-2 text-sm text-purple-100">
                <span className="text-purple-200">✓</span> Send 40 proposals
              </li>
              <li className="flex items-center gap-2 text-sm text-purple-100">
                <span className="text-purple-200">✓</span> Priority support
              </li>
              <li className="flex items-center gap-2 text-sm text-purple-100">
                <span className="text-purple-200">✓</span> Credits never expire
              </li>
            </ul>
            <button className="w-full bg-white text-purple-600 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-50">
              Buy Growth
            </button>
          </div>

          {/* Agency */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="text-sm font-medium text-gray-500 mb-2">Agency</div>
            <div className="text-4xl font-semibold text-gray-900 mb-1">₹3,999</div>
            <div className="text-sm text-gray-400 mb-6">1,200 credits</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Unlock 240 influencer contacts
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Get 60 full AI reports
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Send 120 proposals
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> CSV export
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> API access
              </li>
            </ul>
            <button className="w-full border border-purple-600 text-purple-600 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-50">
              Buy Agency
            </button>
          </div>

        </div>

        {/* Credit table */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">What each action costs</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <div className="text-sm font-medium text-gray-900">Unlock influencer contact</div>
                <div className="text-xs text-gray-400">Get full name, email, and phone number</div>
              </div>
              <div className="text-sm font-semibold text-purple-600">5 credits</div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <div className="text-sm font-medium text-gray-900">Full AI scoring report</div>
                <div className="text-xs text-gray-400">Engagement, fake followers, audience demographics</div>
              </div>
              <div className="text-sm font-semibold text-purple-600">3 credits</div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <div className="text-sm font-medium text-gray-900">Send campaign proposal</div>
                <div className="text-xs text-gray-400">Direct brief to influencer inbox</div>
              </div>
              <div className="text-sm font-semibold text-purple-600">10 credits</div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <div className="text-sm font-medium text-gray-900">Verified badge for influencers</div>
                <div className="text-xs text-gray-400">Stand out — 3x more brand views</div>
              </div>
              <div className="text-sm font-semibold text-purple-600">20 credits</div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-gray-900">Browse and search influencers</div>
                <div className="text-xs text-gray-400">Unlimited searching and filtering</div>
              </div>
              <div className="text-sm font-semibold text-green-600">Free</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}