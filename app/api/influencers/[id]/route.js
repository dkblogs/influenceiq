import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(_request, context) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await context.params

    const influencer = await prisma.influencer.findFirst({ where: { id } })
    if (!influencer) {
      return Response.json({ error: "Influencer not found" }, { status: 404 })
    }

    // Contact details are revealed when brand has an agreed proposal (UnlockedContact created automatically)
    let isUnlocked = false
    if (session?.user?.id) {
      const unlock = await prisma.unlockedContact.findUnique({
        where: { userId_influencerId: { userId: session.user.id, influencerId: id } },
      })
      if (unlock && unlock.expiresAt > new Date()) {
        isUnlocked = true
      }
    }

    const safeInfluencer = {
      ...influencer,
      email: isUnlocked ? influencer.email : null,
      phone: isUnlocked ? influencer.phone : null,
      hasPhone: !!influencer.phone,
    }

    return Response.json({ influencer: safeInfluencer, unlocked: isUnlocked })
  } catch (error) {
    console.error("Influencer fetch error:", error.message)
    return Response.json({ error: "Failed to fetch influencer" }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params
    const { followersPublic, requestingUserId } = await request.json()

    const influencer = await prisma.influencer.findUnique({ where: { id }, select: { userId: true } })
    if (!influencer) return Response.json({ error: "Influencer not found" }, { status: 404 })
    if (influencer.userId !== requestingUserId) return Response.json({ error: "Not authorized" }, { status: 403 })

    const updated = await prisma.influencer.update({ where: { id }, data: { followersPublic } })
    return Response.json({ success: true, followersPublic: updated.followersPublic })
  } catch (error) {
    console.error("Influencer PATCH error:", error.message)
    return Response.json({ error: "Failed to update influencer" }, { status: 500 })
  }
}
