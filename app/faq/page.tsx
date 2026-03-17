"use client"
import { useState } from "react"

const faqs = [
  {
    category: "General",
    questions: [
      { q: "What is InfluenceIQ?", a: "InfluenceIQ is India's first AI-scored influencer marketplace. Brands can discover, verify, and hire micro-influencers across Instagram, YouTube, Facebook, LinkedIn, and X. Every influencer is scored by our AI on real signals like engagement rate, fake followers, and audience quality." },
      { q: "Is InfluenceIQ free to use?", a: "Browsing and searching influencers is completely free. You only spend credits when you unlock a contact (5 credits), get an AI report (3 credits), or send a campaign proposal (10 credits). Every new account gets 5 free credits on sign up." },
      { q: "Which platforms are supported?", a: "We currently support Instagram, YouTube, Facebook, LinkedIn, and X (Twitter). We are working on adding more platforms soon." },
    ]
  },
  {
    category: "Credits",
    questions: [
      { q: "How do credits work?", a: "Credits are InfluenceIQ's currency. You buy a credit pack once and use credits whenever you need them. They never expire. 1 credit is roughly ₹4–5 depending on the pack you buy." },
      { q: "What can I do with credits?", a: "Unlock influencer contact details (5 credits), get a full AI scoring report (3 credits), send a campaign proposal (10 credits), or get a verified badge as an influencer (20 credits)." },
      { q: "Do credits expire?", a: "No. Credits never expire. Buy them whenever you want and use them at your own pace." },
      { q: "Can I get a refund on credits?", a: "We do not offer refunds on credits once purchased. However if you face a technical issue that caused credits to be deducted incorrectly, contact us and we will resolve it within 24 hours." },
    ]
  },
  {
    category: "For Brands",
    questions: [
      { q: "How do I find the right influencer?", a: "Use the search and filter tools on the Discover page. Filter by niche, platform, city, follower count, and AI score. All searches are free. When you find someone interesting, get their AI report for 3 credits before committing." },
      { q: "How do I contact an influencer?", a: "Unlock their contact details for 5 credits to get their email and phone number. Or send them a campaign proposal directly through the platform for 10 credits." },
      { q: "What is an AI report?", a: "An AI report gives you deep analytics on any influencer — engagement breakdown by post type, estimated fake follower percentage, audience demographics, 90-day growth trend, and a brand safety rating. Costs 3 credits." },
    ]
  },
  {
    category: "For Influencers",
    questions: [
      { q: "How do I list my profile?", a: "Go to the Join page and fill in the form. It takes about 5 minutes. Your profile will be reviewed and listed within 24 hours. Listing is completely free." },
      { q: "What is the verified badge?", a: "The verified badge is a mark that shows brands your profile has been manually reviewed and confirmed as genuine. Verified profiles get 3x more brand views. It costs 20 credits — a one-time investment." },
      { q: "Do I pay a commission on deals?", a: "No. InfluenceIQ never takes a commission on any deals made through the platform. Whatever a brand pays you is entirely yours." },
      { q: "Can I set my own rate?", a: "Yes. When you submit your profile you set your average rate per post. You can update this anytime by contacting us." },
    ]
  },
  {
    category: "Payments",
    questions: [
      { q: "What payment methods are accepted?", a: "We accept UPI, all major credit and debit cards, net banking, EMI, and popular wallets. Payments are processed securely by Razorpay." },
      { q: "Is my payment information safe?", a: "Yes. We never store your card or bank details. All payments are processed by Razorpay which is PCI DSS compliant and used by thousands of Indian businesses." },
      { q: "I paid but did not receive my credits. What do I do?", a: "This can happen due to a network issue. Wait 10 minutes and refresh your dashboard. If credits still have not appeared, contact us at hello@influenceiq.in with your payment reference number." },
    ]
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Frequently asked questions</h1>
          <p className="text-gray-500">Everything you need to know about InfluenceIQ.</p>
        </div>

        {/* FAQ sections */}
        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-4">
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.questions.map((item, i) => {
                  const key = `${section.category}-${i}`
                  return (
                    <div key={key} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
                        onClick={() => setOpen(open === key ? null : key)}
                      >
                        <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                        <span className="text-gray-400 ml-4 flex-shrink-0">
                          {open === key ? "−" : "+"}
                        </span>
                      </button>
                      {open === key && (
                        <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                          <div className="pt-3">{item.a}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-purple-50 rounded-2xl p-8 text-center">
          <h2 className="font-semibold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-sm text-gray-500 mb-4">We are happy to help. Reach out anytime.</p>
          <a href="/contact" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700">
            Contact us
          </a>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8 text-center text-sm text-gray-400">
        InfluenceIQ · India's AI Influencer Marketplace · 2025
      </footer>

    </main>
  )
}