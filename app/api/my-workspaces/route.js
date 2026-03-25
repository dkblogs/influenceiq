import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const role = session.user.role

    let workspaces = []

    if (role === "brand") {
      workspaces = await prisma.campaignWorkspace.findMany({
        where: { brandId: userId },
        include: {
          milestones: { orderBy: { order: "asc" } },
          _count: { select: { deliverables: true, reviews: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      })
    } else {
      // influencer — find by influencerId
      const influencer = await prisma.influencer.findFirst({
        where: { userId },
        select: { id: true },
      })
      if (influencer) {
        workspaces = await prisma.campaignWorkspace.findMany({
          where: { influencerId: influencer.id },
          include: {
            milestones: { orderBy: { order: "asc" } },
            _count: { select: { deliverables: true, reviews: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        })
      }
    }

    return Response.json(workspaces)
  } catch (e) {
    console.error("my-workspaces GET:", e.message)
    return Response.json({ error: "Failed to fetch workspaces" }, { status: 500 })
  }
}
