import Groq from "groq-sdk"
import { prisma } from "@/lib/prisma"
import { NICHES } from "@/lib/constants"
import { checkRateLimit, LIMITS } from "@/lib/withRateLimit"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// In-memory cache: { data, generatedAt }
let cache = null
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

const ALL_NICHES = NICHES.filter(n => n !== "Other")

export async function GET() {
  try {
    const rl = await checkRateLimit(LIMITS.nicheTrends, "niche-trends")
    if (rl) return rl

    // Return cached data if fresh
    if (cache && Date.now() - cache.generatedAt < CACHE_TTL_MS) {
      console.log("[niche-trends] Returning cached data")
      return Response.json(cache.data)
    }

    console.log("1. Fetching influencer data from DB...")
    const influencers = await prisma.influencer.findMany({
      where: { verified: true },
      select: {
        niches: true,
        niche: true,
        platforms: true,
        platform: true,
        instagramFollowers: true,
        youtubeFollowers: true,
        engagement: true,
      },
    })
    console.log("2. Influencer count:", influencers.length)

    // Build per-niche stats from real DB data
    const nicheMap = {}

    for (const inf of influencers) {
      const allNiches = inf.niches?.length ? inf.niches : (inf.niche ? [inf.niche] : [])
      const allPlatforms = inf.platforms?.length ? inf.platforms : (inf.platform ? [inf.platform] : [])
      const followers = (inf.instagramFollowers || 0) + (inf.youtubeFollowers || 0)
      const engagement = parseFloat(inf.engagement || "0") || 0

      for (const n of allNiches) {
        if (!n) continue
        if (!nicheMap[n]) {
          nicheMap[n] = { count: 0, platforms: {}, totalFollowers: 0, totalEngagement: 0 }
        }
        nicheMap[n].count++
        nicheMap[n].totalFollowers += followers
        nicheMap[n].totalEngagement += engagement
        for (const p of allPlatforms) {
          if (p) nicheMap[n].platforms[p] = (nicheMap[n].platforms[p] || 0) + 1
        }
      }
    }

    // Format real DB niche stats
    const nicheStats = Object.entries(nicheMap)
      .filter(([, v]) => v.count > 0)
      .map(([niche, v]) => ({
        niche,
        influencerCount: v.count,
        avgFollowers: Math.round(v.totalFollowers / v.count),
        avgEngagement: (v.totalEngagement / v.count).toFixed(2),
        topPlatforms: Object.entries(v.platforms)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([p]) => p),
      }))

    const nichesWithData = new Set(nicheStats.map(n => n.niche.toLowerCase()))
    console.log("3. Niches with real data:", [...nichesWithData])

    console.log("4. Calling Groq API...")
    let completion
    try {
      completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `You are an expert influencer marketing analyst specializing in the Indian market (2025-2026).

Generate niche trend insights for the Indian influencer marketing landscape for ALL of these niches:
${ALL_NICHES.join(", ")}

We have REAL platform data for some niches from InfluenceIQ (use this as verified data):
${JSON.stringify(nicheStats, null, 2)}

Rules:
- For niches WITH real data above — base your insights on the actual numbers provided, set "dataSource": "platform"
- For niches WITHOUT real data — generate realistic insights based on current Indian social media trends, set "dataSource": "ai"
- Cover EVERY niche in the list above, no exceptions
- "hotNiche" must be one of the niches listed above
- momentum must be one of: rising, stable, declining
- trendScore: 0-100

Respond in this EXACT JSON format (no markdown, no extra text):
{
  "trends": [
    {
      "niche": "Fashion",
      "trendScore": 88,
      "momentum": "rising",
      "dataSource": "ai",
      "mostActivePlatforms": ["Instagram", "YouTube"],
      "averageEngagement": "3.8%",
      "bestTimeToPost": "Monday-Friday, 7PM-10PM IST",
      "audienceInsight": "Predominantly 18-30 urban females, aspirational buyers",
      "brandOpportunity": "High ROI for product launches and seasonal collections",
      "creatorTip": "Reels with try-on hauls get 3x more saves than static posts"
    }
  ],
  "overallInsight": "2-3 sentence overview of Indian influencer market in 2025-2026",
  "hotNiche": "Health & Fitness",
  "generatedAt": "${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}"
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      })
    } catch (groqErr) {
      console.error("[niche-trends] Groq API call failed:", groqErr.message, groqErr.stack)
      throw new Error(`Groq API error: ${groqErr.message}`)
    }

    const raw = completion.choices[0]?.message?.content?.trim() || ""
    console.log("5. Groq response length:", raw.length)

    // Extract JSON — strip any markdown fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error(`Groq returned non-JSON response. Raw: ${raw.slice(0, 200)}`)
    const parsed = JSON.parse(jsonMatch[0])

    // Override dataSource based on actual DB data (don't trust AI to get this right)
    parsed.trends = parsed.trends.map(t => ({
      ...t,
      dataSource: nichesWithData.has(t.niche.toLowerCase()) ? "platform" : "ai",
    }))

    // Ensure hotNiche is a valid niche
    const validNicheNames = ALL_NICHES.map(n => n.toLowerCase())
    if (!validNicheNames.includes(parsed.hotNiche?.toLowerCase())) {
      parsed.hotNiche = parsed.trends.sort((a, b) => b.trendScore - a.trendScore)[0]?.niche || ALL_NICHES[0]
    }

    console.log("6. Parsed trends count:", parsed.trends.length)

    const responseData = {
      ...parsed,
      nicheStats,
      totalInfluencers: influencers.length,
    }

    cache = { data: responseData, generatedAt: Date.now() }
    return Response.json(responseData)

  } catch (error) {
    console.error("Niche trends error:", error.message, error.stack)
    // Return cached stale data rather than failing
    if (cache) {
      console.log("[niche-trends] Returning stale cache due to error")
      return Response.json(cache.data)
    }
    return Response.json({
      error: "Failed to generate trends",
      detail: error.message,
    }, { status: 500 })
  }
}
