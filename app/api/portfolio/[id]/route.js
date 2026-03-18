import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function getOwnerCheck(itemId, session) {
  const item = await prisma.portfolioItem.findUnique({
    where: { id: itemId },
    include: { influencer: { select: { userId: true } } },
  })
  if (!item) return { error: "Not found", status: 404 }
  if (item.influencer.userId !== session.user.id) return { error: "Forbidden", status: 403 }
  return { item }
}

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const { error, status, item } = await getOwnerCheck(id, session)
    if (error) return Response.json({ error }, { status })

    const body = await request.json()
    const { brandName, campaignTitle, description, deliverables, results, mediaUrl, completedAt } = body

    const updated = await prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(brandName !== undefined && { brandName }),
        ...(campaignTitle !== undefined && { campaignTitle }),
        description: description ?? item.description,
        deliverables: deliverables ?? item.deliverables,
        results: results ?? item.results,
        mediaUrl: mediaUrl ?? item.mediaUrl,
        completedAt: completedAt !== undefined ? (completedAt ? new Date(completedAt) : null) : item.completedAt,
      },
    })

    return Response.json({ item: updated })
  } catch (error) {
    console.error("Portfolio PATCH error:", error.message)
    return Response.json({ error: "Failed to update portfolio item" }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const { error, status } = await getOwnerCheck(id, session)
    if (error) return Response.json({ error }, { status })

    await prisma.portfolioItem.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error("Portfolio DELETE error:", error.message)
    return Response.json({ error: "Failed to delete portfolio item" }, { status: 500 })
  }
}
