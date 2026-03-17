export default function Terms() {
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

      <div className="px-8 py-16 max-w-3xl mx-auto">

        <h1 className="text-4xl font-semibold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: January 2025</p>

        <div className="space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of terms</h2>
            <p className="text-gray-500 leading-relaxed">By creating an account or using InfluenceIQ you agree to these terms. If you do not agree please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. What InfluenceIQ provides</h2>
            <p className="text-gray-500 leading-relaxed">InfluenceIQ is a marketplace platform that connects brands with influencers. We provide AI scoring, search tools, and a proposal system. We are not a party to any deal made between a brand and an influencer through our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Accounts</h2>
            <p className="text-gray-500 leading-relaxed mb-3">When you create an account you agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>Provide accurate and truthful information</li>
              <li>Keep your password secure and not share your account</li>
              <li>Be responsible for all activity under your account</li>
              <li>Be at least 18 years old</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Credits</h2>
            <p className="text-gray-500 leading-relaxed mb-3">Credits are InfluenceIQ's in-platform currency. By purchasing credits you agree that:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>Credits are non-refundable once purchased</li>
              <li>Credits never expire</li>
              <li>Credits have no cash value and cannot be transferred</li>
              <li>We reserve the right to adjust credit pricing at any time</li>
              <li>If your account is terminated for violating these terms you forfeit any remaining credits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. For influencers</h2>
            <p className="text-gray-500 leading-relaxed mb-3">If you list yourself as an influencer you agree that:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>All information you provide is accurate and up to date</li>
              <li>You own the social media profiles you submit</li>
              <li>You will not artificially inflate your follower count or engagement</li>
              <li>We may remove your profile if we detect fake followers or misleading information</li>
              <li>You are responsible for any deals you make with brands</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. For brands</h2>
            <p className="text-gray-500 leading-relaxed mb-3">If you use InfluenceIQ as a brand you agree that:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>You will use influencer contact details only for legitimate business purposes</li>
              <li>You will not spam, harass, or misuse influencer information</li>
              <li>You are responsible for any campaigns you run with influencers</li>
              <li>You will comply with ASCI guidelines for influencer marketing in India</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Prohibited behaviour</h2>
            <p className="text-gray-500 leading-relaxed mb-3">You must not:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>Use InfluenceIQ for any illegal purpose</li>
              <li>Attempt to hack, scrape, or reverse engineer the platform</li>
              <li>Create fake influencer profiles or brand accounts</li>
              <li>Resell or share contact details unlocked through InfluenceIQ</li>
              <li>Post false reviews or manipulate AI scores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. AI scores and data accuracy</h2>
            <p className="text-gray-500 leading-relaxed">Our AI scores are estimates based on publicly available data. They are provided for guidance only. We do not guarantee the accuracy of any score, metric, or data point. Always do your own due diligence before making business decisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of liability</h2>
            <p className="text-gray-500 leading-relaxed">InfluenceIQ is not liable for any deals, disputes, or outcomes between brands and influencers. We are a marketplace only. Our total liability to you for any claim is limited to the amount of credits you purchased in the last 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h2>
            <p className="text-gray-500 leading-relaxed">We reserve the right to suspend or terminate any account that violates these terms. We will notify you by email if this happens unless the violation is severe.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing law</h2>
            <p className="text-gray-500 leading-relaxed">These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in India.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p className="text-gray-500 leading-relaxed">If you have questions about these terms contact us at hello@influenceiq.in</p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8 text-center text-sm text-gray-400">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}