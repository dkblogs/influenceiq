const APIFY_TOKEN = process.env.APIFY_API_TOKEN

async function pollRun(runId) {
  while (true) {
    await new Promise(r => setTimeout(r, 2000))
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
    // RUNNING or READY — keep polling
  }
}

export async function POST(request) {
  try {
    const { handle, platform } = await request.json()

    if (!handle || !platform) {
      return Response.json({ error: "Missing handle or platform" }, { status: 400 })
    }

    const cleanHandle = handle.replace(/^@/, "")

    if (platform === "instagram") {
      const runRes = await fetch(
        "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${APIFY_TOKEN}`,
          },
          body: JSON.stringify({ usernames: [cleanHandle] }),
        }
      )
      const run = await runRes.json()
      if (!run?.data?.id) {
        return Response.json({ error: "Failed to start Apify run" }, { status: 500 })
      }

      const dataset = await pollRun(run.data.id)
      const profile = dataset?.[0]
      if (!profile) {
        return Response.json({ error: "No profile data returned" }, { status: 404 })
      }

      return Response.json({
        followers: profile.followersCount ?? null,
        bio: profile.biography ?? null,
        postsCount: profile.postsCount ?? null,
        profileImage: profile.profilePicUrl ?? null,
        fullName: profile.fullName ?? null,
        verified: profile.verified ?? false,
        engagement: null,
      })
    }

    if (platform === "youtube") {
      const runRes = await fetch(
        "https://api.apify.com/v2/acts/streamers~youtube-channel-scraper/runs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${APIFY_TOKEN}`,
          },
          body: JSON.stringify({ startUrls: [{ url: `https://www.youtube.com/@${cleanHandle}` }] }),
        }
      )
      const run = await runRes.json()
      if (!run?.data?.id) {
        return Response.json({ error: "Failed to start Apify run" }, { status: 500 })
      }

      const dataset = await pollRun(run.data.id)
      const profile = dataset?.[0]
      if (!profile) {
        return Response.json({ error: "No profile data returned" }, { status: 404 })
      }

      return Response.json({
        followers: profile.numberOfSubscribers ?? profile.subscriberCount ?? null,
        bio: profile.description ?? null,
        postsCount: profile.numberOfVideos ?? null,
        profileImage: profile.thumbnailUrl ?? null,
        fullName: profile.channelName ?? profile.title ?? null,
        verified: profile.isVerified ?? false,
        engagement: null,
      })
    }

    return Response.json({ error: "Unsupported platform" }, { status: 400 })

  } catch (error) {
    console.error("scrape-profile error:", error.message)
    return Response.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
