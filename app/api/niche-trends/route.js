import Groq from "groq-sdk"
import { prisma } from "@/lib/prisma"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// In-memory cache: { data, generatedAt }
let cache = null
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function GET() {
  try {
    // Return cached data if fresh
    if (cache && Date.now() - cache.generatedAt < CACHE_TTL_MS) {
      return Response.json(cache.data)
    }

    // Fetch verified influencers
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

    // Build per-niche stats
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

    // Format nicheStats for Groq prompt
    const nicheStats = Object.entries(nicheMap)
      .filter(([, v]) => v.count > 0)
      .map(([niche, v]) => ({
        niche,
        influencerCount: v.count,
        avgFollowers: v.count > 0 ? Math.round(v.totalFollowers / v.count) : 0,
        avgEngagement: v.count > 0 ? (v.totalEngagement / v.count).toFixed(2) : "0",
        topPlatforms: Object.entries(v.platforms)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([p]) => p),
      }))

    // If no verified influencer data yet, use seed niches for the prompt
    const promptData = nicheStats.length > 0 ? nicheStats : [
      { niche: "Tech", influencerCount: 0, avgFollowers: 0, avgEngagement: "0", topPlatforms: ["YouTube", "Instagram"] },
      { niche: "Fashion", influencerCount: 0, avgFollowers: 0, avgEngagement: "0", topPlatforms: ["Instagram"] },
      { niche: "Food", influencerCount: 0, avgFollowers: 0, avgEngagement: "0", topPlatforms: ["Instagram", "YouTube"] },
      { niche: "Finance", influencerCount: 0, avgFollowers: 0, avgEngagement: "0", topPlatforms: ["YouTube", "LinkedIn"] },
      { niche: "Fitness", influencerCount: 0, avgFollowers: 0, avgEngagement: "0", topPlatforms: ["Instagram", "YouTube"] },
      { niche: "Gaming", influencerCount: 0, avgFollowers: 0, avgEngagement: "0", topPlatforms: ["YouTube"] },
      { niche: "Education", influencerCount: 0, avgFollowers: 0, avgEngagement: "0", topPlatforms: ["YouTube", "Instagram"] },
      { niche: "Lifestyle", influencerCount: 0, avgFollowers: 0, avgEngagement: "0", topPlatforms: ["Instagram"] },
    ]

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "user",
          content: `You are an influencer marketing trends analyst for India. Based on this real platform data from InfluenceIQ:

${JSON.stringify(promptData, null, 2)}

Generate trend insights for each niche in this EXACT JSON format (no markdown, no extra text, just valid JSON):
{
  "trends": [
    {
      "niche": "Tech",
      "trendScore": 85,
      "momentum": "rising",
      "mostActivePlatforms": ["YouTube", "Instagram"],
      "averageEngagement": "4.2%",
      "bestTimeToPost": "Tuesday-Thursday, 6PM-9PM IST",
      "audienceInsight": "Predominantly 18-35 male audience seeking product reviews and tutorials",
      "brandOpportunity": "High ROI for SaaS, gadgets, and fintech brands via YouTube integrations",
      "creatorTip": "Post detailed unboxing and comparison videos on YouTube for maximum reach"
    }
  ],
  "overallInsight": "2-3 sentence overview of Indian influencer market trends in 2025",
  "hotNiche": "Finance",
  "generatedAt": "${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}"
}

Cover ALL of these niches: ${promptData.map(n => n.niche).join(", ")}. momentum must be one of: rising, stable, declining. trendScore 0-100.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const raw = completion.choices[0]?.message?.content?.trim() || ""
    // Extract JSON — strip any markdown fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Groq returned non-JSON response")
    const aiData = JSON.parse(jsonMatch[0])

    const responseData = {
      ...aiData,
      nicheStats,
      totalInfluencers: influencers.length,
    }

    cache = { data: responseData, generatedAt: Date.now() }
    return Response.json(responseData)

  } catch (err) {
    console.error("[niche-trends] Error:", err.message)
    // Return cached stale data rather than failing
    if (cache) return Response.json(cache.data)
    return Response.json({ error: "Failed to generate trends" }, { status: 500 })
  }
}
