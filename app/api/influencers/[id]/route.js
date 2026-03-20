import { prisma } from "@/lib/prisma"

export async function GET(request, context) {
  try {
    const { id } = await context.params

    const influencer = await prisma.influencer.findFirst({
      where: { id },
    })

    if (!influencer) {
      return Response.json({ error: "Influencer not found" }, { status: 404 })
    }

    const safeInfluencer = {
      ...influencer,
      email: null,
      phone: null,
    }
    // AI fields already included via spread

    return Response.json({ influencer: safeInfluencer, unlocked: false })

  } catch (error) {
    console.error("Influencer fetch error:", error.message)
    return Response.json({ error: "Failed to fetch influencer" }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params
    const { followersPublic, requestingUserId } = await request.json()

    // Verify ownership
    const influencer = await prisma.influencer.findUnique({ where: { id }, select: { userId: true } })
    if (!influencer) {
      return Response.json({ error: "Influencer not found" }, { status: 404 })
    }
    if (influencer.userId !== requestingUserId) {
      return Response.json({ error: "Not authorized" }, { status: 403 })
    }

    const updated = await prisma.influencer.update({
      where: { id },
      data: { followersPublic },
    })

    return Response.json({ success: true, followersPublic: updated.followersPublic })

  } catch (error) {
    console.error("Influencer PATCH error:", error.message)
    return Response.json({ error: "Failed to update influencer" }, { status: 500 })
  }
}
