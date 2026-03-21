import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { influencerId } = body
    const userId = session?.user?.id || body.userId

    if (!userId || !influencerId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })

    // Check existing unlock record
    const existing = await prisma.unlockedContact.findUnique({
      where: { userId_influencerId: { userId, influencerId } },
    })

    // Already unlocked and not expired — return contact info for free
    if (existing && existing.expiresAt > new Date()) {
      const influencer = await prisma.influencer.findUnique({
        where: { id: influencerId },
        select: { email: true, phone: true },
      })
      return Response.json({
        success: true,
        alreadyUnlocked: true,
        email: influencer.email,
        phone: influencer.phone,
        newCredits: user.credits,
        expiresAt: existing.expiresAt,
      })
    }

    // Expired — delete old record so we can re-create with fresh expiry
    if (existing && existing.expiresAt <= new Date()) {
      await prisma.unlockedContact.delete({ where: { id: existing.id } })
    }

    // Check credits
    if (user.credits < 5) {
      return Response.json({ error: "Insufficient credits", redirectTo: "/pricing" }, { status: 402 })
    }

    const expiresAt = new Date(Date.now() + THIRTY_DAYS)

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { credits: { decrement: 5 } } }),
      prisma.unlockedContact.create({ data: { userId, influencerId, expiresAt } }),
      prisma.creditTransaction.create({ data: { userId, type: "unlock_contact", amount: -5 } }),
    ])

    const [updatedUser, influencer] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }),
      prisma.influencer.findUnique({ where: { id: influencerId }, select: { email: true, phone: true } }),
    ])

    return Response.json({
      success: true,
      email: influencer.email,
      phone: influencer.phone,
      newCredits: updatedUser.credits,
      expiresAt,
    })
  } catch (error) {
    console.error("Unlock error:", error.message)
    return Response.json({ error: "Failed to unlock contact" }, { status: 500 })
  }
}
