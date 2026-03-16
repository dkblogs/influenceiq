export default function Login() {
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
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="space-y-4">
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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            Sign in
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-xs text-gray-400">or continue with</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        {/* Social buttons */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <span>G</span> Continue with Google
          </button>
        </div>

        {/* Switch to signup */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-purple-600 hover:underline font-medium">
            Sign up free
          </a>
        </p>

      </div>
    </main>
  )
}