import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const APIFY_TOKEN = process.env.APIFY_API_TOKEN

async function pollRun(runId) {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000))
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
      return await dataRes.json()
    }
    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify run ${status}`)
    }
  }
  throw new Error("Apify run timed out")
}

async function scrapeInstagram(handle) {
  const clean = handle.replace(/^@/, "")
  console.log("scrapeInstagram: starting for", clean)
  const runRes = await fetch(
    "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${APIFY_TOKEN}` },
      body: JSON.stringify({ usernames: [clean] }),
    }
  )
  const run = await runRes.json()
  console.log("scrapeInstagram: Apify run response:", JSON.stringify(run?.data?.id), "status:", run?.data?.status)
  if (!run?.data?.id) throw new Error("Failed to start Instagram Apify run")
  const dataset = await pollRun(run.data.id)
  console.log("scrapeInstagram: dataset length:", dataset?.length, "first item keys:", Object.keys(dataset?.[0] || {}))
  const p = dataset?.[0]
  if (!p) throw new Error("No Instagram profile data returned")
  const result = {
    followers: p.followersCount ?? null,
    bio: p.biography ?? null,
    profilePic: p.profilePicUrl ?? null,
    fullName: p.fullName ?? null,
  }
  console.log("scrapeInstagram: mapped result:", JSON.stringify(result))
  return result
}

async function scrapeYouTube(handle) {
  const clean = handle.replace(/^@/, "")
  console.log("scrapeYouTube: starting for", clean)
  const runRes = await fetch(
    "https://api.apify.com/v2/acts/streamers~youtube-channel-scraper/runs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${APIFY_TOKEN}` },
      body: JSON.stringify({ startUrls: [{ url: `https://www.youtube.com/@${clean}` }] }),
    }
  )
  const run = await runRes.json()
  console.log("scrapeYouTube: Apify run response:", JSON.stringify(run?.data?.id), "status:", run?.data?.status)
  if (!run?.data?.id) throw new Error("Failed to start YouTube Apify run")
  const dataset = await pollRun(run.data.id)
  console.log("scrapeYouTube: dataset length:", dataset?.length, "first item keys:", Object.keys(dataset?.[0] || {}))
  const p = dataset?.[0]
  if (!p) throw new Error("No YouTube profile data returned")
  const result = {
    followers: p.numberOfSubscribers ?? p.subscriberCount ?? null,
    bio: p.description ?? null,
    profilePic: p.thumbnailUrl ?? null,
    fullName: p.channelName ?? p.title ?? null,
  }
  console.log("scrapeYouTube: mapped result:", JSON.stringify(result))
  return result
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "influencer") return Response.json({ error: "Only influencers can verify handles" }, { status: 403 })

    const { platform, handle } = await request.json()
    if (!platform || !handle) return Response.json({ error: "platform and handle are required" }, { status: 400 })

    const influencer = await prisma.influencer.findFirst({ where: { userId: session.user.id } })
    if (!influencer) return Response.json({ error: "No influencer profile found" }, { status: 404 })

    console.log("1. Verify handle request:", { platform, handle })

    let scraped
    try {
      if (platform === "instagram") {
        scraped = await scrapeInstagram(handle)
      } else if (platform === "youtube") {
        scraped = await scrapeYouTube(handle)
      } else {
        return Response.json({ error: "platform must be 'instagram' or 'youtube'" }, { status: 400 })
      }
    } catch (e) {
      console.error("2. Scrape error:", e.message)
      return Response.json({ verified: false, error: "Could not fetch profile data" }, { status: 200 })
    }

    console.log("2. Scrape result:", JSON.stringify(scraped))
    console.log("3. Verification check - followers:", scraped?.followers, "bio:", scraped?.bio)

    // Require at least followers > 0 or a bio to count as verified
    const hasData = (scraped.followers && scraped.followers > 0) || scraped.bio
    if (!hasData) {
      return Response.json({ verified: false, error: "Could not fetch profile data" }, { status: 200 })
    }

    let updateData
    if (platform === "instagram") {
      updateData = {
        instagramVerified: true,
        instagramFollowers: scraped.followers ?? null,
        instagramBio: scraped.bio ?? null,
        instagramProfilePic: scraped.profilePic ?? null,
        instagramHandle: handle.startsWith("@") ? handle : `@${handle}`,
      }
    } else {
      updateData = {
        youtubeVerified: true,
        youtubeFollowers: scraped.followers ?? null,
        youtubeBio: scraped.bio ?? null,
        youtubeProfilePic: scraped.profilePic ?? null,
        youtubeHandle: handle.startsWith("@") ? handle : `@${handle}`,
      }
    }

    await prisma.influencer.update({ where: { id: influencer.id }, data: updateData })

    return Response.json({
      verified: true,
      followers: scraped.followers,
      bio: scraped.bio,
      fullName: scraped.fullName,
    })
  } catch (error) {
    console.error("verify-handle error:", error.message)
    return Response.json({ error: "Verification failed" }, { status: 500 })
  }
}
