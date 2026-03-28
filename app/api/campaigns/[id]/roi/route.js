import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "brand") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()

    // Verify campaign belongs to this brand (Campaign uses brandId, not userId)
    const campaign = await prisma.campaign.findFirst({
      where: { id, brandId: session.user.id },
    })
    if (!campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 })
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        roiBudget: body.budget,
        roiInfluencers: body.influencerCount,
        roiAvgFollowers: body.avgFollowers,
        roiEngagement: body.engagementRate,
        roiNiche: body.niche,
        roiEstReach: body.totalReach,
        roiEstImpressions: body.estImpressions,
        roiCPM: body.cpm,
        roiEstClicks: body.estClicks,
        roiEstConversions: body.estConversions,
        roiEstRevenue: body.estRevenue,
        roiCPA: body.cpa,
        roiPercent: body.roiPercent,
        roiSavedAt: new Date(),
      },
    })

    return Response.json({ success: true, campaign: updated })
  } catch (err) {
    console.error("[roi save]", err)
    return Response.json({ error: "Failed to save" }, { status: 500 })
  }
}
