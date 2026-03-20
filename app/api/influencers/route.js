import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Prevent duplicate profiles
    const existing = await prisma.influencer.findFirst({
      where: { userId: session.user.id },
    })
    if (existing) {
      return Response.json({ error: "Influencer profile already exists", influencer: existing }, { status: 409 })
    }

    const body = await request.json()
    const { name, niche, platform, bio, location, followers, engagementRate, handle, email, phone, pricePerPost, instagramHandle, youtubeHandle } = body

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 })
    }

    // Derive initials from name
    const parts = (name || "").trim().split(" ")
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (name.slice(0, 2)).toUpperCase()

    const influencer = await prisma.influencer.create({
      data: {
        userId: session.user.id,
        name,
        handle: handle ? (handle.startsWith("@") ? handle : `@${handle}`) : `@${(email || name || "user").split("@")[0].replace(/[^a-z0-9]/gi, "_")}`,
        location: location || "",
        niche: niche || "Other",
        platform: platform || "Instagram",
        followers: followers ? String(followers) : "0",
        engagement: engagementRate ? `${engagementRate}%` : "0%",
        score: 50,
        rate: pricePerPost ? `₹${pricePerPost}/post` : "₹0/post",
        initials,
        about: bio || null,
        email: email || null,
        phone: phone || null,
        instagramHandle: instagramHandle ? (instagramHandle.startsWith("@") ? instagramHandle : `@${instagramHandle}`) : null,
        youtubeHandle: youtubeHandle ? (youtubeHandle.startsWith("@") ? youtubeHandle : `@${youtubeHandle}`) : null,
      },
    })

    return Response.json({ influencer })
  } catch (error) {
    if (error.code === "P2002") {
      return Response.json({ error: "That handle is already taken" }, { status: 409 })
    }
    console.error("Influencer POST error:", error.message)
    return Response.json({ error: "Failed to create profile" }, { status: 500 })
  }
}

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
        profileImage: true,
        verified: true,
        userId: true,
        followersPublic: true,
        instagramHandle: true,
        instagramVerified: true,
        instagramFollowers: true,
        youtubeHandle: true,
        youtubeVerified: true,
        youtubeFollowers: true,
      },
    })

    return Response.json({ influencers })

  } catch (error) {
    console.error("Influencers error:", error.message)
    return Response.json({ error: "Failed to fetch influencers" }, { status: 500 })
  }
}