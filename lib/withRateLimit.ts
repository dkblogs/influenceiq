import { rateLimit } from "./rateLimit"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { headers } from "next/headers"

type LimitConfig = { limit: number; windowMs: number }

export async function checkRateLimit(
  config: LimitConfig,
  routeKey: string,
): Promise<Response | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any) as any
  const headersList = await headers()
  const ip =
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "unknown"

  const identifier = session?.user?.id
    ? `${routeKey}_user_${session.user.id}`
    : `${routeKey}_ip_${ip}`

  const result = rateLimit(identifier, config.limit, config.windowMs)

  if (!result.success) {
    const retryAfter = Math.ceil(result.resetIn / 1000)
    return Response.json(
      { error: "Too many requests. Please slow down.", retryAfter },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    )
  }
  return null
}

export const LIMITS = {
  auth:          { limit: 5,  windowMs: 15 * 60 * 1000 },       // 5 per 15 min
  aiInfluencer:  { limit: 4,  windowMs: 24 * 60 * 60 * 1000 },  // 4 per 24 hours
  aiBrand:       { limit: 20, windowMs: 60 * 60 * 1000 },        // 20 per hour
  bioWriter:     { limit: 5,  windowMs: 60 * 60 * 1000 },        // 5 per hour
  nicheTrends:   { limit: 20, windowMs: 60 * 60 * 1000 },        // 20 per hour
  payment:       { limit: 5,  windowMs: 60 * 60 * 1000 },        // 5 per hour
  verifyHandle:  { limit: 3,  windowMs: 60 * 60 * 1000 },        // 3 per hour
  scrapeProfile: { limit: 3,  windowMs: 60 * 60 * 1000 },        // 3 per hour
  proposals:     { limit: 10, windowMs: 24 * 60 * 60 * 1000 },   // 10 per day
  applyCampaign: { limit: 15, windowMs: 24 * 60 * 60 * 1000 },   // 15 per day
}
