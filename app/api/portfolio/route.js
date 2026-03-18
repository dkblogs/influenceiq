import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get("influencerId")
    if (!influencerId) {
      return Response.json({ error: "Missing influencerId" }, { status: 400 })
    }
    const items = await prisma.portfolioItem.findMany({
      where: { influencerId },
      orderBy: { completedAt: "desc" },
    })
    return Response.json({ items })
  } catch (error) {
    console.error("Portfolio GET error:", error.message)
    return Response.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { influencerId, brandName, campaignTitle, description, deliverables, results, mediaUrl, completedAt } = body

    if (!influencerId || !brandName || !campaignTitle) {
      return Response.json({ error: "influencerId, brandName, and campaignTitle are required" }, { status: 400 })
    }

    // Verify the session user owns this influencer profile
    const influencer = await prisma.influencer.findUnique({ where: { id: influencerId } })
    if (!influencer || influencer.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const item = await prisma.portfolioItem.create({
      data: {
        influencerId,
        brandName,
        campaignTitle,
        description: description || null,
        deliverables: deliverables || null,
        results: results || null,
        mediaUrl: mediaUrl || null,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
    })

    return Response.json({ item })
  } catch (error) {
    console.error("Portfolio POST error:", error.message)
    return Response.json({ error: "Failed to create portfolio item" }, { status: 500 })
  }
}
