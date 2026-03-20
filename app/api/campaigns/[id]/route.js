import { prisma } from "@/lib/prisma"

export async function GET(request, context) {
  try {
    const { id } = await context.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    })

    if (!campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 })
    }

    const brand = await prisma.user.findUnique({
      where: { id: campaign.brandId },
      select: { id: true, name: true, companyName: true, brandVerified: true },
    })

    return Response.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        niche: campaign.niche,
        platform: campaign.platform,
        budget: campaign.budget,
        deadline: campaign.deadline,
        location: campaign.location,
        minFollowers: campaign.minFollowers,
        slots: campaign.slots,
        status: campaign.status,
        applicants: campaign._count.applications,
        createdAt: campaign.createdAt,
        brand: brand?.companyName || brand?.name || "Unknown Brand",
        brandId: campaign.brandId,
        brandVerified: brand?.brandVerified ?? false,
        brandInitials: (brand?.companyName || brand?.name || "BR").slice(0, 2).toUpperCase(),
      },
    })
  } catch (error) {
    console.error("Campaign fetch error:", error.message)
    return Response.json({ error: "Failed to fetch campaign" }, { status: 500 })
  }
}
