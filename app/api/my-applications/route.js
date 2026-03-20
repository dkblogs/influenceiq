import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const applications = await prisma.campaignApplication.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            niche: true,
            platform: true,
            budget: true,
            deadline: true,
            location: true,
            status: true,
            brandId: true,
          },
        },
      },
    })

    // Fetch brand names for all unique brandIds
    const brandIds = [...new Set(applications.map(a => a.campaign?.brandId).filter(Boolean))]
    const brands = await prisma.user.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true, companyName: true },
    })
    const brandMap = Object.fromEntries(brands.map(b => [b.id, b.companyName || b.name || "Unknown Brand"]))

    const result = applications.map(app => ({
      id: app.id,
      status: app.status,
      appliedAt: app.createdAt,
      campaign: app.campaign
        ? { ...app.campaign, brandName: brandMap[app.campaign.brandId] ?? "Unknown Brand" }
        : null,
    }))

    return Response.json({ applications: result })
  } catch (error) {
    console.error("my-applications error:", error.message)
    return Response.json({ error: "Failed to load applications" }, { status: 500 })
  }
}
