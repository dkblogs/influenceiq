import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")
    if (!campaignId) {
      return Response.json({ error: "Missing campaignId" }, { status: 400 })
    }

    // Verify this campaign belongs to the requesting brand
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { brandId: true },
    })
    if (!campaign || campaign.brandId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const applications = await prisma.campaignApplication.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    })

    // Get influencer profiles for each applicant
    const userIds = applications.map(a => a.userId)
    const influencers = await prisma.influencer.findMany({
      where: { userId: { in: userIds } },
      select: {
        id: true,
        userId: true,
        name: true,
        niche: true,
        platform: true,
        instagramVerified: true,
        youtubeVerified: true,
        verified: true,
        aiScore: true,
        score: true,
        followers: true,
        initials: true,
      },
    })
    const influencerByUserId = Object.fromEntries(influencers.map(i => [i.userId, i]))

    const result = applications.map(app => ({
      id: app.id,
      userId: app.userId,
      status: app.status,
      appliedAt: app.createdAt,
      influencer: influencerByUserId[app.userId] ?? null,
    }))

    return Response.json({ applications: result })
  } catch (error) {
    console.error("Campaign applications GET error:", error.message)
    return Response.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
