"use client"
import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useApp } from "@/app/context/AppContext"

export default function Navbar() {
  const { data: session, status } = useSession()
  const { credits, unreadCount } = useApp()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [discoverOpen, setDiscoverOpen] = useState(false)
  const [campaignsOpen, setCampaignsOpen] = useState(false)
  const [creditsOpen, setCreditsOpen] = useState(false)
  const discoverRef = useRef<HTMLDivElement>(null)
  const campaignsRef = useRef<HTMLDivElement>(null)
  const creditsRef = useRef<HTMLDivElement>(null)
  const user = session?.user as any

  const loggedIn = status === "authenticated"
  const role = user?.role

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setDiscoverOpen(false)
      }
      if (campaignsRef.current && !campaignsRef.current.contains(e.target as Node)) {
        setCampaignsOpen(false)
      }
      if (creditsRef.current && !creditsRef.current.contains(e.target as Node)) {
        setCreditsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function navLink(href: string, label: string) {
    const isActive = pathname === href
    return (
      <a
        key={href}
        href={href}
        className={`text-sm transition-colors whitespace-nowrap ${isActive ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8] hover:text-[#F8FAFC]"}`}
      >
        {label}
      </a>
    )
  }

  const CampaignsDropdown = ({ mobile = false }: { mobile?: boolean }) => (
    <div ref={mobile ? undefined : campaignsRef} className={mobile ? "" : "relative"}>
      <button
        onClick={() => setCampaignsOpen(o => !o)}
        className={`text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
          pathname === "/campaigns" || pathname === "/my-campaigns" || pathname === "/proposals" || pathname.startsWith("/proposals/") ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8] hover:text-[#F8FAFC]"
        }`}
      >
        Campaigns
        <svg className={`w-3 h-3 transition-transform ${campaignsOpen ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {campaignsOpen && (
        <div className={mobile
          ? "flex flex-col pl-3 mt-1"
          : "absolute top-full left-0 mt-2 w-44 bg-[#12121A] border border-[#1E1E2E] rounded-xl shadow-xl z-50 overflow-hidden"
        }>
          <a
            href="/campaigns"
            onClick={() => setCampaignsOpen(false)}
            className={mobile
              ? "text-sm py-2 text-[#94A3B8] hover:text-[#F8FAFC] border-b border-[#1E1E2E] transition-colors"
              : "block px-4 py-2.5 text-sm text-[#94A3B8] hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors"
            }
          >
            All Campaigns
          </a>
          <a
            href="/my-campaigns"
            onClick={() => setCampaignsOpen(false)}
            className={mobile
              ? "text-sm py-2 text-[#94A3B8] hover:text-[#F8FAFC] border-b border-[#1E1E2E] transition-colors"
              : "block px-4 py-2.5 text-sm text-[#94A3B8] hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors"
            }
          >
            My Campaigns
          </a>
          <a
            href="/proposals"
            onClick={() => setCampaignsOpen(false)}
            className={mobile
              ? "text-sm py-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              : "block px-4 py-2.5 text-sm text-[#94A3B8] hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors"
            }
          >
            Proposals
          </a>
        </div>
      )}
    </div>
  )

  const DiscoverDropdown = ({ mobile = false }: { mobile?: boolean }) => (
    <div ref={mobile ? undefined : discoverRef} className={mobile ? "" : "relative"}>
      <button
        onClick={() => setDiscoverOpen(o => !o)}
        className={`text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
          pathname.startsWith("/discover") ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8] hover:text-[#F8FAFC]"
        }`}
      >
        Discover
        <svg className={`w-3 h-3 transition-transform ${discoverOpen ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {discoverOpen && (
        <div className={mobile
          ? "flex flex-col pl-3 mt-1"
          : "absolute top-full left-0 mt-2 w-44 bg-[#12121A] border border-[#1E1E2E] rounded-xl shadow-xl z-50 overflow-hidden"
        }>
          <a
            href="/discover/brands"
            onClick={() => setDiscoverOpen(false)}
            className={mobile
              ? "text-sm py-2 text-[#94A3B8] hover:text-[#F8FAFC] border-b border-[#1E1E2E] transition-colors"
              : "block px-4 py-2.5 text-sm text-[#94A3B8] hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors"
            }
          >
            Brands
          </a>
          <a
            href="/discover/influencers"
            onClick={() => setDiscoverOpen(false)}
            className={mobile
              ? "text-sm py-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              : "block px-4 py-2.5 text-sm text-[#94A3B8] hover:bg-[#1E1E2E] hover:text-[#F8FAFC] transition-colors"
            }
          >
            Influencers
          </a>
        </div>
      )}
    </div>
  )

  const BellIcon = () => (
    <a href="/notifications" className="relative text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </a>
  )

  const CreditsChip = () => (
    <div ref={creditsRef} className="relative">
      <button
        onClick={() => setCreditsOpen(o => !o)}
        className="flex items-center bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full hover:bg-purple-500/20 transition-colors"
      >
        <span className="text-xs text-purple-400 font-medium">
          {credits !== null ? `${credits} credits` : "…"}
        </span>
      </button>
      {creditsOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-[#12121A] border border-[#1E1E2E] rounded-xl shadow-xl shadow-black/40 py-1 z-50">
          <a
            href="/pricing"
            onClick={() => setCreditsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E1E2E] transition-colors"
          >
            💳 Buy credits
          </a>
          <a
            href="/credits"
            onClick={() => setCreditsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E1E2E] transition-colors"
          >
            📋 View history
          </a>
        </div>
      )}
    </div>
  )

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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          {!loggedIn && (pathname === "/for-brands" || pathname === "/for-influencers") && (
            <>
              {navLink("/about", "About Us")}
              {navLink("/why", "Why InfluenceIQ")}
              {navLink("/pricing", "Pricing")}
              {navLink("/contact", "Contact Us")}
              <span className="w-px h-4 bg-[#1E1E2E]" />
              {navLink("/login", "Log in")}
              <a
                href={pathname === "/for-influencers" ? "/signup?role=influencer" : "/signup?role=brand"}
                className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
              >
                Sign up free
              </a>
            </>
          )}
          {!loggedIn && pathname !== "/for-brands" && pathname !== "/for-influencers" && (
            <>
              {navLink("/login", "Log in")}
              <a
                href="/signup"
                className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
              >
                Sign up
              </a>
            </>
          )}

          {loggedIn && role === "brand" && (
            <>
              {navLink("/dashboard", "Dashboard")}
              {navLink("/profile", "Profile")}
              <DiscoverDropdown />
              <CampaignsDropdown />
              {navLink("/contact", "Contact Us")}
              <span className="w-px h-4 bg-[#1E1E2E]" />
              <BellIcon />
              <CreditsChip />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Sign out
              </button>
            </>
          )}

          {loggedIn && role === "influencer" && (
            <>
              {navLink("/dashboard", "Dashboard")}
              {navLink("/profile", "Profile")}
              <a
                href="/campaigns"
                className="relative px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 font-medium text-sm hover:bg-purple-600/30 hover:text-purple-200 transition-all"
              >
                💰 Campaigns
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </a>
              {navLink("/proposals", "Proposals")}
              {navLink("/contact", "Contact Us")}
              <span className="w-px h-4 bg-[#1E1E2E]" />
              <BellIcon />
              <CreditsChip />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Sign out
              </button>
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
          {!loggedIn && (pathname === "/for-brands" || pathname === "/for-influencers") && (
            <>
              {[
                { href: "/about", label: "About Us" },
                { href: "/why", label: "Why InfluenceIQ" },
                { href: "/pricing", label: "Pricing" },
                { href: "/contact", label: "Contact Us" },
              ].map(l => (
                <a key={l.href} href={l.href} className={`text-sm py-2.5 border-b border-[#1E1E2E] ${pathname === l.href ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8]"}`}>{l.label}</a>
              ))}
              <a href="/login" className="text-sm text-[#94A3B8] py-2.5 border-b border-[#1E1E2E]">Log in</a>
              <a href={pathname === "/for-influencers" ? "/signup?role=influencer" : "/signup?role=brand"} className="mt-2 text-sm bg-purple-600 text-white px-4 py-2.5 rounded-lg text-center hover:bg-purple-500 transition-colors">Sign up free</a>
            </>
          )}
          {!loggedIn && pathname !== "/for-brands" && pathname !== "/for-influencers" && (
            <>
              <a href="/login" className="text-sm text-[#94A3B8] py-2.5 border-b border-[#1E1E2E]">Log in</a>
              <a href="/signup" className="mt-2 text-sm bg-purple-600 text-white px-4 py-2.5 rounded-lg text-center hover:bg-purple-500 transition-colors">Sign up</a>
            </>
          )}

          {loggedIn && role === "brand" && (
            <>
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/profile", label: "Profile" },
                { href: "/contact", label: "Contact Us" },
              ].map(l => (
                <a key={l.href} href={l.href} className={`text-sm py-2.5 border-b border-[#1E1E2E] ${pathname === l.href ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8]"}`}>{l.label}</a>
              ))}
              <div className="py-1 border-b border-[#1E1E2E]">
                <DiscoverDropdown mobile />
              </div>
              <div className="py-1 border-b border-[#1E1E2E]">
                <CampaignsDropdown mobile />
              </div>
              <a href="/notifications" className="flex items-center justify-between text-sm py-2.5 border-b border-[#1E1E2E] text-[#94A3B8]">
                Notifications
                {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </a>
              <div className="text-xs text-purple-400 font-medium py-2.5 border-b border-[#1E1E2E]">
                {credits !== null ? `${credits} credits` : "…"}
              </div>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-red-400 py-2.5 text-left">Sign out</button>
            </>
          )}

          {loggedIn && role === "influencer" && (
            <>
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/profile", label: "Profile" },
                { href: "/campaigns", label: "Campaigns" },
                { href: "/proposals", label: "Proposals" },
                { href: "/contact", label: "Contact Us" },
              ].map(l => (
                <a key={l.href} href={l.href} className={`text-sm py-2.5 border-b border-[#1E1E2E] ${pathname === l.href ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8]"}`}>{l.label}</a>
              ))}
              <a href="/notifications" className="flex items-center justify-between text-sm py-2.5 border-b border-[#1E1E2E] text-[#94A3B8]">
                Notifications
                {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </a>
              <div className="text-xs text-purple-400 font-medium py-2.5 border-b border-[#1E1E2E]">
                {credits !== null ? `${credits} credits` : "…"}
              </div>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-red-400 py-2.5 text-left">Sign out</button>
            </>
          )}
        </div>
      )}
    </>
  )
}
