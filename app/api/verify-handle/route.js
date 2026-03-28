import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getInfluencerForUser } from "@/lib/getInfluencerForUser"
import { checkRateLimit, LIMITS } from "@/lib/withRateLimit"

const APIFY_TOKEN = process.env.APIFY_API_TOKEN

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "IIQ-"
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

async function pollRun(runId) {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: { "Authorization": `Bearer ${APIFY_TOKEN}` },
    })
    const data = await res.json()
    const status = data.data.status
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

async function fetchInstagramBio(handle) {
  const clean = handle.replace(/^@/, "")
  const runRes = await fetch(
    "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${APIFY_TOKEN}` },
      body: JSON.stringify({ usernames: [clean] }),
    }
  )
  const run = await runRes.json()
  if (!run?.data?.id) throw new Error("Failed to start Instagram Apify run")
  const dataset = await pollRun(run.data.id)
  const p = dataset?.[0]
  if (!p) throw new Error("No Instagram profile data returned")
  return {
    bio: p.biography ?? "",
    followers: p.followersCount ?? null,
    profilePic: p.profilePicUrl ?? null,
    fullName: p.fullName ?? null,
  }
}

async function fetchYouTubeBio(handle) {
  const clean = handle.replace(/^@/, "")
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
    bio: p.description ?? "",
    followers: p.numberOfSubscribers ?? p.subscriberCount ?? null,
    profilePic: p.thumbnailUrl ?? null,
    fullName: p.channelName ?? p.title ?? null,
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "influencer") return Response.json({ error: "Only influencers can verify handles" }, { status: 403 })

    const rl = await checkRateLimit(LIMITS.verifyHandle, "verify-handle")
    if (rl) return rl

    const { platform, handle, step } = await request.json()
    if (!platform || !handle || !step) return Response.json({ error: "platform, handle and step are required" }, { status: 400 })

    const influencer = await getInfluencerForUser({ userId: session.user.id, email: session.user.email })
    if (!influencer) return Response.json({ error: "No influencer profile found" }, { status: 404 })

    const normalHandle = handle.startsWith("@") ? handle : `@${handle}`

    // ── Step 1: Generate code ──────────────────────────────────────────────
    if (step === "generate") {
      const code = generateCode()
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h from now

      const updateData = platform === "instagram"
        ? { instagramHandle: normalHandle, instagramVerifyCode: code, instagramVerifyExpiry: expiry, instagramVerified: false }
        : { youtubeHandle: normalHandle, youtubeVerifyCode: code, youtubeVerifyExpiry: expiry, youtubeVerified: false }

      await prisma.influencer.update({ where: { id: influencer.id }, data: updateData })

      return Response.json({ code, message: "Add this code to your bio, then click verify" })
    }

    // ── Step 2: Check code ─────────────────────────────────────────────────
    if (step === "check") {
      const storedCode = platform === "instagram" ? influencer.instagramVerifyCode : influencer.youtubeVerifyCode
      const expiry = platform === "instagram" ? influencer.instagramVerifyExpiry : influencer.youtubeVerifyExpiry

      if (!storedCode) {
        return Response.json({ verified: false, error: "No verification code found. Generate a new one first." })
      }
      if (!expiry || new Date() > expiry) {
        return Response.json({ verified: false, error: "Code expired. Generate a new one." })
      }

      let scraped
      try {
        scraped = platform === "instagram"
          ? await fetchInstagramBio(handle)
          : await fetchYouTubeBio(handle)
      } catch (e) {
        console.error("verify-handle scrape error:", e.message)
        return Response.json({ verified: false, error: "Could not fetch your profile — Apify scrape failed. Try again." })
      }

      if (!scraped.bio || !scraped.bio.includes(storedCode)) {
        return Response.json({
          verified: false,
          error: `Code not found in bio. Make sure you added ${storedCode} to your bio and try again.`,
        })
      }

      // Code found — mark verified, save data, clear code
      const updateData = platform === "instagram"
        ? {
            instagramVerified: true,
            instagramFollowers: scraped.followers ?? null,
            instagramBio: scraped.bio ?? null,
            instagramProfilePic: scraped.profilePic ?? null,
            instagramVerifyCode: null,
            instagramVerifyExpiry: null,
          }
        : {
            youtubeVerified: true,
            youtubeFollowers: scraped.followers ?? null,
            youtubeBio: scraped.bio ?? null,
            youtubeProfilePic: scraped.profilePic ?? null,
            youtubeVerifyCode: null,
            youtubeVerifyExpiry: null,
          }

      await prisma.influencer.update({ where: { id: influencer.id }, data: updateData })

      // Fire-and-forget engagement calculation for Instagram only
      if (platform === "instagram" && scraped.followers) {
        const cleanUsername = handle.replace(/^@/, "")
        calculateEngagementRate(cleanUsername, scraped.followers).then(async (engagementRate) => {
          if (engagementRate) {
            await prisma.influencer.update({ where: { id: influencer.id }, data: { engagement: engagementRate } })
            console.log(`[engagement] saved ${engagementRate} for ${cleanUsername}`)
          }
        }).catch(err => {
          console.error("[engagement] background save failed:", err.message)
        })
      }

      return Response.json({ verified: true, followers: scraped.followers, bio: scraped.bio })
    }

    return Response.json({ error: "step must be 'generate' or 'check'" }, { status: 400 })
  } catch (error) {
    console.error("verify-handle error:", error.message)
    return Response.json({ error: "Verification failed" }, { status: 500 })
  }
}
