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
    console.log("1. Session:", session?.user?.id)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("4. Request body:", body)
    const { brandName, campaignTitle, description, deliverables, results, mediaUrl, completedAt } = body

    if (!brandName || !campaignTitle) {
      return Response.json({ error: "brandName and campaignTitle are required" }, { status: 400 })
    }

    console.log("2. Looking up influencer for userId:", session.user.id)
    const influencer = await prisma.influencer.findFirst({
      where: { userId: session.user.id },
    })
    console.log("3. Influencer found:", influencer)
    if (!influencer) {
      return Response.json({ error: "No influencer profile linked to your account" }, { status: 403 })
    }

    console.log("5. Creating portfolio item with influencerId:", influencer?.id)
    const item = await prisma.portfolioItem.create({
      data: {
        influencerId: influencer.id,
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
    console.error("Portfolio POST error:", error.message, error.stack)
    return Response.json({ error: "Failed to create portfolio item", details: error.message }, { status: 500 })
  }
}
