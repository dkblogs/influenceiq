import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { fromUserId, influencerId, brandId, message } = body

    if (!fromUserId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: fromUserId },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    if (user.credits < 10) {
      return Response.json({ error: "Not enough credits. You need 10 credits to send a request." }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: fromUserId },
      data: { credits: { decrement: 10 } },
    })

    await prisma.collaborationRequest.create({
      data: {
        fromUserId,
        influencerId: influencerId || null,
        brandId: brandId || null,
        message: message || null,
      },
    })

    await prisma.creditTransaction.create({
      data: {
        userId: fromUserId,
        type: "collaboration_request",
        amount: -10,
      },
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id: fromUserId },
      select: { credits: true },
    })

    return Response.json({
      success: true,
      newCredits: updatedUser.credits,
    })

  } catch (error) {
    console.error("Send request error:", error.message)
    return Response.json({ error: "Failed to send request" }, { status: 500 })
  }
}