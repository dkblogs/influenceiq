import Navbar from "@/app/components/Navbar"

export default function Join() {
  return (
    <main className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="px-8 py-12 max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-purple-50 text-purple-700 text-sm px-4 py-1 rounded-full mb-4">
            For Influencers
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Get discovered by top brands
          </h1>
          <p className="text-gray-500">
            List your profile for free. AI scores you automatically. Brands send proposals directly to you.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl mb-2">🆓</div>
            <div className="text-sm font-medium text-gray-900">Free listing</div>
            <div className="text-xs text-gray-400 mt-1">No cost to join</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm font-medium text-gray-900">AI scored</div>
            <div className="text-xs text-gray-400 mt-1">Auto verified</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl mb-2">📩</div>
            <div className="text-sm font-medium text-gray-900">Direct proposals</div>
            <div className="text-xs text-gray-400 mt-1">Brands reach you</div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="font-medium text-gray-900 mb-6">Your profile</h2>

          <form className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                placeholder="you@example.com"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                placeholder="Mumbai, Delhi, Bangalore..."
              />
            </div>

            {/* Primary platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary platform</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600">
                <option>Select platform</option>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
                <option>X (Twitter)</option>
              </select>
            </div>

            {/* Profile URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile URL</label>
              <input
                type="url"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                placeholder="https://instagram.com/yourhandle"
              />
            </div>

            {/* Niche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your niche</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600">
                <option>Select niche</option>
                <option>Food & Lifestyle</option>
                <option>Tech & Gadgets</option>
                <option>Fashion & Beauty</option>
                <option>Finance & Business</option>
                <option>Health & Fitness</option>
                <option>Travel</option>
                <option>Education</option>
                <option>Entertainment</option>
                <option>Gaming</option>
                <option>Other</option>
              </select>
            </div>

            {/* Followers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follower count</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 text-gray-600">
                <option>Select range</option>
                <option>1,000 – 10,000</option>
                <option>10,000 – 50,000</option>
                <option>50,000 – 100,000</option>
                <option>100,000 – 500,000</option>
                <option>500,000+</option>
              </select>
            </div>

            {/* Average rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Average rate per post (₹)</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                placeholder="e.g. 5000"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              Submit my profile — free
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your profile will be reviewed and listed within 24 hours.
          </p>
        </div>
      </div>
    </main>
  )
}