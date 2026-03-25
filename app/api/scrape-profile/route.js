import { checkRateLimit, LIMITS } from "@/lib/withRateLimit"

const APIFY_TOKEN = process.env.APIFY_API_TOKEN

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

    const { instagramHandle, youtubeHandle } = await request.json()

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

    return Response.json(result)

  } catch (error) {
    console.error("scrape-profile error:", error.message)
    return Response.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
