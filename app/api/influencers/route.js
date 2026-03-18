import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const niche = searchParams.get("niche")
    const platform = searchParams.get("platform")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    // Fast path: return just this user's linked influencer profile
    if (userId) {
      const influencer = await prisma.influencer.findFirst({
        where: { userId },
      })
      return Response.json({ influencers: influencer ? [influencer] : [] })
    }

    const where = {}

    if (niche && niche !== "All") {
      where.niche = niche
    }

    if (platform && platform !== "All") {
      where.platform = platform
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { handle: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ]
    }

    const influencers = await prisma.influencer.findMany({
      where,
      orderBy: { score: "desc" },
      select: {
        id: true,
        name: true,
        handle: true,
        location: true,
        niche: true,
        platform: true,
        followers: true,
        engagement: true,
        score: true,
        rate: true,
        initials: true,
        verified: true,
        userId: true,
        followersPublic: true,
      },
    })

    return Response.json({ influencers })

  } catch (error) {
    console.error("Influencers error:", error.message)
    return Response.json({ error: "Failed to fetch influencers" }, { status: 500 })
  }
}