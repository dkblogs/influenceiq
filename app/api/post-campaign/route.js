import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, title, description, niche, platforms, budget, deadline, slots, minFollowers, location } = body

    if (!userId || !title || !description || !niche || !platforms?.length || !budget) {
      return Response.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    if (user.credits < 15) {
      return Response.json({ error: "Insufficient credits", redirectTo: "/pricing" }, { status: 402 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 15 } },
    })

    const campaign = await prisma.campaign.create({
      data: {
        brandId: userId,
        title,
        description,
        niche,
        platform: platforms[0],
        platforms,
        budget,
        deadline: deadline || "30 days",
        slots: parseInt(slots) || 1,
        minFollowers: minFollowers || "1K",
        location: location || "Pan India",
        status: "Open",
      },
    })

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: "post_campaign",
        amount: -15,
      },
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    return Response.json({
      success: true,
      campaignId: campaign.id,
      newCredits: updatedUser.credits,
    })

  } catch (error) {
    console.error("Post campaign error:", error.message)
    return Response.json({ error: "Failed to post campaign" }, { status: 500 })
  }
}