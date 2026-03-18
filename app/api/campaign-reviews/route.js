import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get("influencerId")

    if (!influencerId) {
      return Response.json({ error: "influencerId required" }, { status: 400 })
    }

    const reviews = await prisma.campaignReview.findMany({
      where: { influencerId },
      orderBy: { createdAt: "desc" },
    })

    const formatted = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      campaignName: r.namePublic ? r.campaignName : "Private Campaign",
      campaignDesc: r.namePublic ? r.campaignDesc : null,
      review: r.reviewPublic ? r.review : "Review kept private",
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
