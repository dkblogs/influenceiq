import { checkRateLimit, LIMITS } from "@/lib/withRateLimit"
import { prisma } from "@/lib/prisma"

const APIFY_TOKEN = process.env.APIFY_API_TOKEN

async function calculateEngagementRate(username, followersCount) {
  try {
    const runRes = await fetch(
      "https://api.apify.com/v2/acts/apify~instagram-scraper/runs",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${APIFY_TOKEN}` },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${username}/`],
          resultsType: "posts",
          resultsLimit: 12,
          addParentData: false,
        }),
      }
    )
    if (!runRes.ok) return null
    const runData = await runRes.json()
    const runId = runData.data?.id
    if (!runId) return null

    let datasetId = null
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const statusRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        { headers: { "Authorization": `Bearer ${APIFY_TOKEN}` } }
      )
      const statusData = await statusRes.json()
      const status = statusData.data?.status
      if (status === "SUCCEEDED") { datasetId = statusData.data?.defaultDatasetId; break }
      if (status === "FAILED" || status === "ABORTED") return null
    }

    if (!datasetId) return null

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items`,
      { headers: { "Authorization": `Bearer ${APIFY_TOKEN}` } }
    )
    const posts = await itemsRes.json()
    if (!Array.isArray(posts) || posts.length === 0) return null

    const totalEngagement = posts.reduce((sum, post) => {
      return sum + (post.likesCount || post.likes || 0) + (post.commentsCount || post.comments || 0)
    }, 0)
    const avgEngagement = totalEngagement / posts.length
    const rate = followersCount > 0 ? ((avgEngagement / followersCount) * 100).toFixed(2) : "0"
    return `${rate}%`
  } catch (err) {
    console.error("[engagement-calc] failed:", err.message)
    return null
  }
}

async function pollRun(runId) {
  while (true) {
    await new Promise(r => setTimeout(r, 2000))
    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: { "Authorization": `Bearer ${APIFY_TOKEN}` },
    })
    const data = await res.json()
    const status = data.data.status
    console.log("Apify poll status:", status)

    if (status === "SUCCEEDED") {
      const dataRes = await fetch(
        `https://api.apify.com/v2/datasets/${data.data.defaultDatasetId}/items`,
        { headers: { "Authorization": `Bearer ${APIFY_TOKEN}` } }
      )
      const dataset = await dataRes.json()
      console.log("Apify dataset:", JSON.stringify(dataset))
      return dataset
    }

    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify run ${status}`)
    }
  }
}

async function scrapeInstagram(handle) {
  const clean = handle.replace(/^@/, "")
  console.log("scrape-profile scrapeInstagram: starting for", clean)
  const runRes = await fetch(
    "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${APIFY_TOKEN}` },
      body: JSON.stringify({ usernames: [clean] }),
    }
  )
  const run = await runRes.json()
  console.log("Apify run started:", run.data?.id)
  if (!run?.data?.id) throw new Error("Failed to start Instagram Apify run")
  const dataset = await pollRun(run.data.id)
  const p = dataset?.[0]
  if (!p) throw new Error("No Instagram profile data returned")
  const profile = {
    followers: p.followersCount ?? null,
    bio: p.biography ?? null,
    postsCount: p.postsCount ?? null,
    profileImage: p.profilePicUrl ?? null,
    fullName: p.fullName ?? null,
    verified: p.verified ?? false,
    engagement: null,
  }
  console.log("Mapped profile:", JSON.stringify(profile))
  return profile
}

async function scrapeYouTube(handle) {
  const clean = handle.replace(/^@/, "")
  console.log("scrape-profile scrapeYouTube: starting for", clean)
  const runRes = await fetch(
    "https://api.apify.com/v2/acts/streamers~youtube-channel-scraper/runs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${APIFY_TOKEN}` },
      body: JSON.stringify({ startUrls: [{ url: `https://www.youtube.com/@${clean}` }] }),
    }
  )
  const run = await runRes.json()
  if (!run?.data?.id) throw new Error("Failed to start YouTube Apify run")
  const dataset = await pollRun(run.data.id)
  const p = dataset?.[0]
  if (!p) throw new Error("No YouTube profile data returned")
  return {
    followers: p.numberOfSubscribers ?? p.subscriberCount ?? null,
    bio: p.description ?? null,
    postsCount: p.numberOfVideos ?? null,
    profileImage: p.thumbnailUrl ?? null,
    fullName: p.channelName ?? p.title ?? null,
    verified: p.isVerified ?? false,
    engagement: null,
  }
}

export async function POST(request) {
  try {
    const rl = await checkRateLimit(LIMITS.scrapeProfile, "scrape-profile")
    if (rl) return rl

    const { instagramHandle, youtubeHandle, influencerId } = await request.json()

    if (!instagramHandle && !youtubeHandle) {
      return Response.json({ error: "Provide at least one handle (instagramHandle or youtubeHandle)" }, { status: 400 })
    }

    let result = {}

    if (instagramHandle && youtubeHandle) {
      // Both — scrape Instagram first, fill missing fields from YouTube
      const [igData, ytData] = await Promise.allSettled([
        scrapeInstagram(instagramHandle),
        scrapeYouTube(youtubeHandle),
      ])
      const ig = igData.status === "fulfilled" ? igData.value : {}
      const yt = ytData.status === "fulfilled" ? ytData.value : {}
      result = {
        followers: ig.followers ?? yt.followers ?? null,
        bio: ig.bio ?? yt.bio ?? null,
        postsCount: ig.postsCount ?? yt.postsCount ?? null,
        profileImage: ig.profileImage ?? yt.profileImage ?? null,
        fullName: ig.fullName ?? yt.fullName ?? null,
        verified: ig.verified || yt.verified || false,
        engagement: null,
        instagramFollowers: ig.followers ?? null,
        youtubeFollowers: yt.followers ?? null,
      }
    } else if (instagramHandle) {
      result = await scrapeInstagram(instagramHandle)
    } else {
      result = await scrapeYouTube(youtubeHandle)
    }

    // Fire-and-forget engagement calculation if Instagram was scraped and influencerId provided
    const igFollowers = result.instagramFollowers ?? (instagramHandle ? result.followers : null)
    if (instagramHandle && influencerId && igFollowers) {
      const cleanUsername = instagramHandle.replace(/^@/, "")
      calculateEngagementRate(cleanUsername, igFollowers).then(async (engagementRate) => {
        if (engagementRate) {
          await prisma.influencer.update({ where: { id: influencerId }, data: { engagement: engagementRate } })
          console.log(`[engagement] saved ${engagementRate} for ${cleanUsername}`)
        }
      }).catch(err => {
        console.error("[engagement] background save failed:", err.message)
      })
    }

    return Response.json(result)

  } catch (error) {
    console.error("scrape-profile error:", error.message)
    return Response.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
