import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const GROQ_API_KEY = process.env.GROQ_API_KEY
const CACHE_DAYS = 7

export async function GET(_req, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const influencer = await prisma.influencer.findFirst({ where: { id } })
    if (!influencer) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    // Auth: only brand or the influencer themselves
    const isBrand = session.user.role === "brand"
    const isOwner = influencer.userId === session.user.id
    if (!isBrand && !isOwner) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // Return cache if fresh (under 7 days)
    if (influencer.analyticsData && influencer.analyticsUpdatedAt) {
      const daysSince = (Date.now() - new Date(influencer.analyticsUpdatedAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < CACHE_DAYS) {
        return Response.json({ analytics: JSON.parse(influencer.analyticsData), cached: true })
      }
    }

    // Need fresh data — check if Instagram is verified
    if (!influencer.instagramVerified || !influencer.instagramHandle) {
      return Response.json({ error: "No verified Instagram handle" }, { status: 400 })
    }

    const username = influencer.instagramHandle.replace(/^@/, "")
    const followers = influencer.instagramFollowers || 1

    // --- APIFY: fetch last 12 posts ---
    let posts = []
    try {
      const runRes = await fetch(
        "https://api.apify.com/v2/acts/apify~instagram-scraper/runs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${APIFY_TOKEN}`,
          },
          body: JSON.stringify({
            directUrls: [`https://www.instagram.com/${username}/`],
            resultsType: "posts",
            resultsLimit: 12,
            addParentData: false,
          }),
        }
      )
      const runData = await runRes.json()
      const runId = runData.data?.id

      if (runId) {
        let datasetId = null
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 3000))
          const statusRes = await fetch(
            `https://api.apify.com/v2/actor-runs/${runId}`,
            { headers: { "Authorization": `Bearer ${APIFY_TOKEN}` } }
          )
          const statusData = await statusRes.json()
          if (statusData.data?.status === "SUCCEEDED") {
            datasetId = statusData.data?.defaultDatasetId
            break
          }
          if (["FAILED", "ABORTED"].includes(statusData.data?.status)) break
        }

        if (datasetId) {
          const itemsRes = await fetch(
            `https://api.apify.com/v2/datasets/${datasetId}/items`,
            { headers: { "Authorization": `Bearer ${APIFY_TOKEN}` } }
          )
          posts = await itemsRes.json()
          if (!Array.isArray(posts)) posts = []
        }
      }
    } catch (err) {
      console.error("[analytics] Apify error:", err.message)
    }

    // --- CALCULATE real metrics from posts ---
    const realMetrics = calculateRealMetrics(posts, followers)

    // --- GROQ: estimate audience demographics ---
    const aiEstimates = await estimateAudienceWithAI(influencer, realMetrics)

    // --- Combine and cache ---
    const analytics = {
      real: realMetrics,
      ai: aiEstimates,
      generatedAt: new Date().toISOString(),
      postCount: posts.length,
    }

    await prisma.influencer.update({
      where: { id },
      data: {
        analyticsData: JSON.stringify(analytics),
        analyticsUpdatedAt: new Date(),
      },
    })

    return Response.json({ analytics, cached: false })
  } catch (err) {
    console.error("[analytics] error:", err.message)
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

function calculateRealMetrics(posts, followers) {
  if (!posts.length) return null

  const likes = posts.map(p => p.likesCount || p.likes || 0)
  const comments = posts.map(p => p.commentsCount || p.comments || 0)
  const views = posts.map(p => p.videoViewCount || p.viewCount || p.videoViews || 0)
  const types = posts.map(p => p.type || (p.isVideo ? "video" : "image"))
  const timestamps = posts.map(p => p.timestamp).filter(Boolean)
  const hashtags = posts.flatMap(p => p.hashtags || [])

  const avgLikes = Math.round(likes.reduce((a, b) => a + b, 0) / posts.length)
  const avgComments = Math.round(comments.reduce((a, b) => a + b, 0) / posts.length)
  const videoCount = views.filter(v => v > 0).length
  const avgViews = videoCount > 0 ? Math.round(views.reduce((a, b) => a + b, 0) / videoCount) : 0
  const engagementRate = ((avgLikes + avgComments) / followers * 100).toFixed(2)

  // Content type breakdown
  const typeCount = types.reduce((acc, t) => {
    const key = t?.includes("video") || t === "Video" ? "video"
      : t?.includes("sidecar") || t === "Sidecar" ? "carousel"
      : "image"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  // Posting frequency (posts per week)
  let postsPerWeek = null
  if (timestamps.length >= 2) {
    const sorted = timestamps.map(t => new Date(t)).sort((a, b) => a - b)
    const spanDays = (sorted[sorted.length - 1] - sorted[0]) / (1000 * 60 * 60 * 24)
    postsPerWeek = spanDays > 0 ? ((timestamps.length / spanDays) * 7).toFixed(1) : null
  }

  // Top hashtags
  const hashtagFreq = hashtags.reduce((acc, h) => {
    acc[h] = (acc[h] || 0) + 1
    return acc
  }, {})
  const topHashtags = Object.entries(hashtagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag)

  // Engagement trend (per post, chronological)
  const engagementTrend = posts
    .slice()
    .reverse()
    .map(p => ({
      engagement: followers > 0
        ? (((p.likesCount || 0) + (p.commentsCount || 0)) / followers * 100).toFixed(2)
        : "0",
      likes: p.likesCount || 0,
      comments: p.commentsCount || 0,
      type: p.type || "image",
      timestamp: p.timestamp || null,
    }))

  return {
    avgLikes,
    avgComments,
    avgViews,
    engagementRate,
    postsPerWeek,
    topHashtags,
    contentTypes: typeCount,
    engagementTrend,
    totalPostsAnalyzed: posts.length,
  }
}

async function estimateAudienceWithAI(influencer, realMetrics) {
  try {
    const prompt = `You are analyzing an Indian social media influencer to estimate their audience demographics.

Influencer data:
- Name: ${influencer.name}
- Location: ${influencer.location || "India"}
- Niche/Content: ${influencer.niches?.join(", ") || influencer.niche}
- Platform: ${influencer.platforms?.join(", ") || influencer.platform}
- Followers: ${influencer.instagramFollowers?.toLocaleString() || "unknown"}
- Bio: ${influencer.instagramBio || influencer.about || "not provided"}
- Engagement Rate: ${realMetrics?.engagementRate || influencer.engagement || "unknown"}
- Top Hashtags: ${realMetrics?.topHashtags?.slice(0, 5).join(", ") || "unknown"}
- Content Types: ${JSON.stringify(realMetrics?.contentTypes || {})}

Based on this data, estimate the audience demographics. These are ESTIMATES based on content analysis — be realistic for the Indian creator economy.

Respond ONLY with valid JSON, no explanation, no markdown:
{
  "ageGroups": [
    {"label": "13-17", "percent": 0},
    {"label": "18-24", "percent": 0},
    {"label": "25-34", "percent": 0},
    {"label": "35-44", "percent": 0},
    {"label": "45+", "percent": 0}
  ],
  "genderSplit": {
    "male": 0,
    "female": 0,
    "other": 0
  },
  "topLocations": [
    {"city": "Mumbai", "percent": 0},
    {"city": "Delhi", "percent": 0},
    {"city": "Bangalore", "percent": 0},
    {"city": "Other India", "percent": 0},
    {"city": "International", "percent": 0}
  ],
  "audienceInterests": ["interest1", "interest2", "interest3", "interest4"],
  "bestPostingTimes": ["7-9 PM IST", "12-2 PM IST"],
  "audienceSummary": "2 sentence description of the likely audience"
}

All percentages in each group must sum to 100. Use realistic Indian creator economy benchmarks.`

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 800,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ""
    const clean = text.replace(/```json|```/g, "").trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error("[analytics] Groq error:", err.message)
    return null
  }
}
