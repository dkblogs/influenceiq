import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get("brandId")

    const where = brandId ? { brandId } : { status: "Open" }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    })

    const brandIds = [...new Set(campaigns.map((c) => c.brandId))]
    const brands = await prisma.user.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true, brandVerified: true },
    })
    const brandMap = Object.fromEntries(brands.map((b) => [b.id, b]))

    const formatted = campaigns.map((c) => {
      const brand = brandMap[c.brandId]
      return {
        id: c.id,
        brandId: c.brandId,
        brand: brand?.name || "Brand",
        brandInitials: brand?.name ? brand.name.slice(0, 2).toUpperCase() : "BR",
        brandColor: "bg-purple-500",
        brandVerified: brand?.brandVerified ?? false,
        title: c.title,
        description: c.description,
        niche: c.niche,
        platform: c.platform,
        budget: c.budget,
        deadline: c.deadline,
        applicants: c._count.applications,
        slots: c.slots,
        location: c.location,
        minFollowers: c.minFollowers,
        status: c.status,
      }
    })

    return Response.json({ campaigns: formatted })

  } catch (error) {
    console.error("Campaigns error:", error.message)
    return Response.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}