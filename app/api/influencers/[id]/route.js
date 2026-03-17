import { prisma } from "@/lib/prisma"

export async function GET(request, context) {
  try {
    const id = context.params.id

    const influencer = await prisma.influencer.findFirst({
      where: { id: id },
    })

    if (!influencer) {
      return Response.json({ error: "Influencer not found" }, { status: 404 })
    }

    const safeInfluencer = {
      ...influencer,
      email: null,
      phone: null,
    }

    return Response.json({ influencer: safeInfluencer, unlocked: false })

  } catch (error) {
    console.error("Influencer fetch error:", error.message)
    return Response.json({ error: "Failed to fetch influencer" }, { status: 500 })
  }
}