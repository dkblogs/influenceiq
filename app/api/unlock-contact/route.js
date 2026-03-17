import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { influencerId, userId } = body

    if (!userId || !influencerId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    if (user.credits < 5) {
      return Response.json({ error: "Not enough credits. You need 5 credits to unlock a contact." }, { status: 400 })
    }

    const existing = await prisma.unlockedContact.findUnique({
      where: {
        userId_influencerId: { userId, influencerId },
      },
    })

    if (existing) {
      const influencer = await prisma.influencer.findUnique({
        where: { id: influencerId },
        select: { email: true, phone: true },
      })
      return Response.json({
        success: true,
        email: influencer.email,
        phone: influencer.phone,
        newCredits: user.credits,
        message: "Already unlocked",
      })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    })

    await prisma.unlockedContact.create({
      data: { userId, influencerId },
    })

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: "unlock_contact",
        amount: -5,
      },
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
      select: { email: true, phone: true },
    })

    return Response.json({
      success: true,
      email: influencer.email,
      phone: influencer.phone,
      newCredits: updatedUser.credits,
    })

  } catch (error) {
    console.error("Unlock error:", error.message)
    return Response.json({ error: "Failed to unlock contact" }, { status: 500 })
  }
}