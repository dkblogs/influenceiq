import Navbar from "@/app/components/Navbar"

export default function Privacy() {
  return (
    <main className="min-h-screen bg-white">

      <Navbar />

      <div className="px-8 py-16 max-w-3xl mx-auto">

        <h1 className="text-4xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: January 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Who we are</h2>
            <p className="text-gray-500 leading-relaxed">InfluenceIQ is an AI-powered influencer marketplace based in India. We connect brands with influencers across Instagram, YouTube, Facebook, LinkedIn, and X. Our website is erasekit.vercel.app.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. What information we collect</h2>
            <p className="text-gray-500 leading-relaxed mb-3">We collect the following information when you use InfluenceIQ:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>Your name and email address when you create an account</li>
              <li>Payment transaction records via Razorpay — we never store card or bank details</li>
              <li>Influencer profile information submitted through our Join form</li>
              <li>Usage data such as pages visited and searches performed</li>
              <li>Communications sent through our contact form</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How we use your information</h2>
            <p className="text-gray-500 leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>Create and manage your account</li>
              <li>Process credit purchases and maintain your credit balance</li>
              <li>Display influencer profiles to brands</li>
              <li>Send transactional emails such as payment confirmations</li>
              <li>Improve our platform and fix issues</li>
              <li>Respond to your support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. How we store your information</h2>
            <p className="text-gray-500 leading-relaxed">Your data is stored securely on Supabase servers. We use encryption to protect sensitive data. We retain your data for as long as your account is active. You can request deletion of your account and data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sharing your information</h2>
            <p className="text-gray-500 leading-relaxed mb-3">We do not sell your personal data. We share data only in the following cases:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>With Razorpay to process payments</li>
              <li>With influencers — only the contact details a brand has paid to unlock</li>
              <li>With brands — only the profile information an influencer has submitted publicly</li>
              <li>When required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
            <p className="text-gray-500 leading-relaxed">We use essential cookies to keep you logged in and remember your session. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your rights</h2>
            <p className="text-gray-500 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-500 leading-relaxed mt-3">To exercise any of these rights contact us at hello@influenceiq.in</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children</h2>
            <p className="text-gray-500 leading-relaxed">InfluenceIQ is not intended for users under the age of 18. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to this policy</h2>
            <p className="text-gray-500 leading-relaxed">We may update this policy from time to time. We will notify you of significant changes by email or by posting a notice on our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p className="text-gray-500 leading-relaxed">If you have any questions about this privacy policy please contact us at hello@influenceiq.in</p>
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