import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get("influencerId")
    const ownerId = searchParams.get("ownerId") // set by client when logged-in user is the profile owner

    if (!influencerId) {
      return Response.json({ error: "influencerId required" }, { status: 400 })
    }

    // Verify ownership: check that the ownerId matches influencer.userId
    let isOwner = false
    if (ownerId) {
      const influencer = await prisma.influencer.findUnique({ where: { id: influencerId }, select: { userId: true } })
      isOwner = influencer?.userId === ownerId
    }

    const reviews = await prisma.campaignReview.findMany({
      where: { influencerId },
      orderBy: { createdAt: "desc" },
    })

    const formatted = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      // Owner sees real values + flags; others see masked values
      campaignName: isOwner ? r.campaignName : (r.namePublic ? r.campaignName : "Private Campaign"),
      campaignDesc: isOwner ? r.campaignDesc : (r.namePublic ? r.campaignDesc : null),
      review: isOwner ? r.review : (r.reviewPublic ? r.review : "Review kept private"),
      namePublic: isOwner ? r.namePublic : undefined,
      reviewPublic: isOwner ? r.reviewPublic : undefined,
      createdAt: r.createdAt,
    }))

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return Response.json({ reviews: formatted, total: reviews.length, avgRating })
  } catch (error) {
    console.error("Campaign reviews GET error:", error.message)
    return Response.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { id, namePublic, reviewPublic } = await request.json()

    if (!id) {
      return Response.json({ error: "Review id required" }, { status: 400 })
    }

    const data = {}
    if (namePublic !== undefined) data.namePublic = namePublic
    if (reviewPublic !== undefined) data.reviewPublic = reviewPublic

    const updated = await prisma.campaignReview.update({
      where: { id },
      data,
    })

    return Response.json({ success: true, review: updated })
  } catch (error) {
    console.error("Campaign reviews PATCH error:", error.message)
    return Response.json({ error: "Failed to update review" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { campaignId, influencerId, brandId, rating, review, campaignName, campaignDesc, namePublic, reviewPublic } = body

    if (!campaignId || !influencerId || !brandId || !rating || !campaignName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const existing = await prisma.campaignReview.findUnique({
      where: { campaignId_influencerId_brandId: { campaignId, influencerId, brandId } },
    })

    if (existing) {
      return Response.json({ error: "You have already reviewed this influencer for this campaign" }, { status: 409 })
    }

    const created = await prisma.campaignReview.create({
      data: {
        campaignId,
        influencerId,
        brandId,
        rating,
        review: review || "",
        campaignName,
        campaignDesc: campaignDesc || "",
        namePublic: namePublic !== false,
        reviewPublic: reviewPublic !== false,
      },
    })

    return Response.json({ success: true, review: created })
  } catch (error) {
    if (error.code === "P2002") {
      return Response.json({ error: "You have already reviewed this influencer for this campaign" }, { status: 409 })
    }
    console.error("Campaign reviews POST error:", error.message)
    return Response.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
