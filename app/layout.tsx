import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Providers from "./providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "InfluenceIQ — India's AI-Scored Influencer Marketplace",
    template: "%s | InfluenceIQ",
  },
  description:
    "Discover, verify, and hire micro-influencers across Instagram, YouTube, LinkedIn and more. InfluenceIQ uses AI to score every creator on engagement, audience quality, and niche authority. India's first AI-scored influencer marketplace.",
  keywords: [
    "influencer marketplace India",
    "AI influencer scoring",
    "micro influencer platform",
    "find influencers India",
    "brand influencer collaboration",
    "Instagram influencers India",
    "YouTube influencers India",
    "influencer marketing platform",
    "verified influencers",
    "influencer AI score",
  ],
  authors: [{ name: "InfluenceIQ" }],
  creator: "InfluenceIQ",
  publisher: "InfluenceIQ",
  metadataBase: new URL("https://erasekit.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://erasekit.vercel.app",
    siteName: "InfluenceIQ",
    title: "InfluenceIQ — India's AI-Scored Influencer Marketplace",
    description:
      "Find the right influencer, powered by AI. Discover and hire verified micro-influencers across Instagram, YouTube, LinkedIn and more. Every creator is scored on 6 real signals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "InfluenceIQ — India's AI-Scored Influencer Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InfluenceIQ — India's AI-Scored Influencer Marketplace",
    description:
      "Find the right influencer, powered by AI. Discover and hire verified micro-influencers across Instagram, YouTube, LinkedIn and more.",
    images: ["/og-image.png"],
    creator: "@influenceiq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
