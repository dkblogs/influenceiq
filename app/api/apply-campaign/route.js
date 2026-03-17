import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { campaignId, userId } = body

    if (!userId || !campaignId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    if (user.credits < 2) {
      return Response.json({ error: "Not enough credits. You need 2 credits to apply." }, { status: 400 })
    }

    const existing = await prisma.campaignApplication.findUnique({
      where: {
        campaignId_userId: { campaignId, userId },
      },
    })

    if (existing) {
      return Response.json({ error: "You have already applied to this campaign." }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 2 } },
    })

    await prisma.campaignApplication.create({
      data: { campaignId, userId },
    })

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: "campaign_application",
        amount: -2,
      },
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    return Response.json({
      success: true,
      newCredits: updatedUser.credits,
    })

  } catch (error) {
    console.error("Apply campaign error:", error.message)
    return Response.json({ error: "Failed to apply" }, { status: 500 })
  }
}