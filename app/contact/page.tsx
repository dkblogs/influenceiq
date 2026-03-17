export default function Contact() {
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
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Get in touch</h1>
          <p className="text-gray-500 text-lg">We are here to help. Reach out anytime.</p>
        </div>

        <div className="grid grid-cols-2 gap-10">

          {/* Contact form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="font-medium text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600">
                  <option>Brand / Business</option>
                  <option>Influencer / Creator</option>
                  <option>Agency</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600">
                  <option>General enquiry</option>
                  <option>Payment issue</option>
                  <option>Account problem</option>
                  <option>Partnership</option>
                  <option>Report an influencer</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 h-32 resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                Send message
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-2xl mb-3">📧</div>
              <div className="font-medium text-gray-900 mb-1">Email us</div>
              <div className="text-sm text-gray-500 mb-2">We reply within 24 hours on working days.</div>
              <a href="mailto:hello@influenceiq.in" className="text-sm text-purple-600 font-medium">
                hello@influenceiq.in
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-2xl mb-3">💬</div>
              <div className="font-medium text-gray-900 mb-1">Live chat</div>
              <div className="text-sm text-gray-500 mb-2">Available Monday to Saturday, 10am to 6pm IST.</div>
              <button className="text-sm text-purple-600 font-medium">Start a chat →</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-2xl mb-3">🏢</div>
              <div className="font-medium text-gray-900 mb-1">Office</div>
              <div className="text-sm text-gray-500">
                InfluenceIQ<br />
                India
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="font-medium text-purple-900 mb-2">For influencers</div>
              <div className="text-sm text-purple-700 mb-3">
                Want to list your profile or have questions about getting verified?
              </div>
              <a href="/join" className="text-sm text-purple-600 font-medium">
                Visit the influencer page →
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8 text-center text-sm text-gray-400 mt-8">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}