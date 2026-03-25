import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params

    const workspace = await prisma.campaignWorkspace.findUnique({ where: { id } })
    if (!workspace) return Response.json({ error: "Not found" }, { status: 404 })

    const influencer = await prisma.influencer.findFirst({
      where: { id: workspace.influencerId },
      select: { userId: true },
    })
    const isBrand = workspace.brandId === session.user.id
    const isInfluencer = influencer?.userId === session.user.id
    if (!isBrand && !isInfluencer) return Response.json({ error: "Forbidden" }, { status: 403 })

    const { rating, comment } = await request.json()
    if (!rating || !comment) return Response.json({ error: "rating and comment required" }, { status: 400 })
    if (rating < 1 || rating > 5) return Response.json({ error: "rating must be 1-5" }, { status: 400 })

    const reviewerRole = isBrand ? "brand" : "influencer"

    // Check for existing review from this user
    const existing = await prisma.workspaceReview.findFirst({
      where: { workspaceId: id, reviewerId: session.user.id },
    })
    if (existing) return Response.json({ error: "You already left a review" }, { status: 400 })

    const review = await prisma.workspaceReview.create({
      data: {
        workspaceId: id,
        reviewerId: session.user.id,
        reviewerRole,
        rating,
        comment,
      },
    })

    const notifyUserId = isBrand ? influencer?.userId : workspace.brandId
    if (notifyUserId) {
      prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: "workspace_review",
          title: "New Review",
          message: `You received a ${rating}-star review for "${workspace.campaignTitle}"`,
          link: `/workspace/${id}`,
        },
      }).catch(() => {})
    }

    return Response.json(review, { status: 201 })
  } catch (e) {
    console.error("review POST:", e.message)
    return Response.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
