import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: "Open" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    })

    const formatted = campaigns.map((c) => ({
      id: c.id,
      brand: "Brand",
      brandInitials: "BR",
      brandColor: "bg-purple-500",
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
    }))

    return Response.json({ campaigns: formatted })

  } catch (error) {
    console.error("Campaigns error:", error.message)
    return Response.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}