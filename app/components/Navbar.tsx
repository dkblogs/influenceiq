"use client"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [brandVerified, setBrandVerified] = useState(false)

  const user = session?.user as any
  const loggedIn = status !== "loading" && !!session
  const role = user?.role

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user-credits?userId=${(session.user as any).id}`)
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.credits === "number") setCredits(d.credits)
          setBrandVerified(d.brandVerified ?? false)
        })
    }
  }, [session?.user?.id])

  function link(href: string, label: string, extraClass = "") {
    const isActive = pathname === href
    return (
      <a
        key={href}
        href={href}
        className={`text-sm transition-colors ${isActive ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8] hover:text-[#F8FAFC]"} ${extraClass}`}
      >
        {label}
      </a>
    )
  }

  const centerLinks: { href: string; label: string }[] = loggedIn
    ? role === "brand"
      ? [
          { href: "/discover", label: "Discover" },
          { href: "/brands", label: "Brands" },
          { href: "/campaigns", label: "Campaigns" },
          { href: "/leaderboard", label: "Leaderboard" },
          { href: "/post-campaign", label: "Post Campaign" },
        ]
      : [
          { href: "/discover", label: "Discover" },
          { href: "/brands", label: "Brands" },
          { href: "/campaigns", label: "Campaigns" },
          { href: "/leaderboard", label: "Leaderboard" },
          { href: "/bio-writer", label: "Bio Writer" },
        ]
    : [
        { href: "/discover", label: "Discover" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/pricing", label: "Pricing" },
      ]

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#1E1E2E] sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md z-50">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold text-[#F8FAFC]">
            Influence<span className="text-purple-400">IQ</span>
          </span>
        </a>

        {/* Desktop center links */}
        <div className="hidden md:flex items-center gap-5">
          {centerLinks.map((l) => link(l.href, l.label))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {loggedIn ? (
            <>
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
                <span className="text-xs text-purple-400 font-medium">
                  {credits !== null ? `${credits} credits` : "…"}
                </span>
              </div>
              {role === "brand" && (
                brandVerified ? (
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full">
                    ✓ Verified
                  </span>
                ) : (
                  <a
                    href="/verify-brand"
                    className="text-xs bg-[#1E1E2E] text-[#64748B] border border-[#1E1E2E] px-3 py-1.5 rounded-full hover:border-blue-500/30 hover:text-blue-400 transition-colors"
                  >
                    Get Verified
                  </a>
                )
              )}
              {link("/dashboard", "Dashboard")}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              {link("/login", "Log in")}
              <a
                href="/signup"
                className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
              >
                Sign up
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-[#94A3B8] transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#94A3B8] transition-all ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#94A3B8] transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden sticky top-[65px] z-40 border-b border-[#1E1E2E] bg-[#0A0A0F] px-4 py-4 flex flex-col gap-1">
          {centerLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm py-2.5 border-b border-[#1E1E2E] transition-colors ${pathname === l.href ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8]"}`}
            >
              {l.label}
            </a>
          ))}
          {loggedIn ? (
            <>
              <div className="text-xs text-purple-400 font-medium py-2.5 border-b border-[#1E1E2E]">
                {credits !== null ? `${credits} credits` : "…"}
              </div>
              {role === "brand" && (
                brandVerified ? (
                  <span className="text-sm text-blue-400 py-2.5 border-b border-[#1E1E2E]">✓ Verified</span>
                ) : (
                  <a href="/verify-brand" className="text-sm text-[#64748B] py-2.5 border-b border-[#1E1E2E]">
                    Get Verified
                  </a>
                )
              )}
              <a href="/dashboard" className="text-sm text-[#94A3B8] py-2.5 border-b border-[#1E1E2E]">
                Dashboard
              </a>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-red-400 py-2.5 text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm text-[#94A3B8] py-2.5 border-b border-[#1E1E2E]">
                Log in
              </a>
              <a
                href="/signup"
                className="mt-2 text-sm bg-purple-600 text-white px-4 py-2.5 rounded-lg text-center hover:bg-purple-500 transition-colors"
              >
                Sign up
              </a>
            </>
          )}
        </div>
      )}
    </>
  )
}
