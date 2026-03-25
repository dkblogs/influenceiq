import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, context) {
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

    const { milestoneId, status } = await request.json()
    if (!milestoneId || !status) return Response.json({ error: "milestoneId and status required" }, { status: 400 })

    // Fetch the target milestone and all milestones for sequential check
    const [targetMilestone, allMilestones] = await Promise.all([
      prisma.workspaceMilestone.findUnique({ where: { id: milestoneId } }),
      prisma.workspaceMilestone.findMany({ where: { workspaceId: workspace.id }, orderBy: { order: "asc" } }),
    ])
    if (!targetMilestone) return Response.json({ error: "Milestone not found" }, { status: 404 })

    // Enforce sequential order — all previous milestones must be completed
    const previousIncomplete = allMilestones.filter(m => m.order < targetMilestone.order && m.status !== "completed")
    if (previousIncomplete.length > 0) {
      return Response.json({
        error: `Complete "${previousIncomplete[0].title}" first before proceeding`,
      }, { status: 400 })
    }

    const milestone = await prisma.workspaceMilestone.update({
      where: { id: milestoneId },
      data: {
        status,
        completedAt: status === "completed" ? new Date() : null,
      },
    })

    // Notify the other party
    const notifyUserId = isBrand ? influencer?.userId : workspace.brandId
    if (notifyUserId) {
      prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: "workspace_milestone",
          title: "Milestone Updated",
          message: `Milestone "${milestone.title}" marked as ${status} for "${workspace.campaignTitle}"`,
          link: `/workspace/${id}`,
        },
      }).catch(() => {})
    }

    return Response.json(milestone)
  } catch (e) {
    console.error("milestone PATCH:", e.message)
    return Response.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}
