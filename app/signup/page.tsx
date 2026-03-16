export default function Signup() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-semibold">
              Influence<span className="text-purple-600">IQ</span>
            </span>
          </a>
          <p className="text-gray-500 text-sm mt-2">Create your free account</p>
        </div>

        {/* Account type selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="border-2 border-purple-600 bg-purple-50 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">🏢</div>
            <div className="text-sm font-medium text-purple-700">I am a Brand</div>
            <div className="text-xs text-purple-500 mt-0.5">Find influencers</div>
          </button>
          <button className="border border-gray-200 rounded-xl p-3 text-center hover:border-purple-300">
            <div className="text-xl mb-1">⭐</div>
            <div className="text-sm font-medium text-gray-700">I am an Influencer</div>
            <div className="text-xs text-gray-400 mt-0.5">Get discovered</div>
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            Create account — free
          </button>
        </form>

        {/* Note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          You get 5 free credits on sign up. No credit card needed.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        {/* Social */}
        <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <span>G</span> Continue with Google
        </button>

        {/* Switch to login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 hover:underline font-medium">
            Sign in
          </a>
        </p>

      </div>
    </main>
  )
}