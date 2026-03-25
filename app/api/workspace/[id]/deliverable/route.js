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
    const isInfluencer = influencer?.userId === session.user.id
    if (!isInfluencer) return Response.json({ error: "Only influencer can submit deliverables" }, { status: 403 })

    const { title, description, fileUrl } = await request.json()
    if (!title) return Response.json({ error: "title required" }, { status: 400 })

    const deliverable = await prisma.workspaceDeliverable.create({
      data: {
        workspaceId: id,
        title,
        description,
        fileUrl,
        status: "submitted",
        submittedAt: new Date(),
      },
    })

    prisma.notification.create({
      data: {
        userId: workspace.brandId,
        type: "workspace_deliverable",
        title: "New Deliverable Submitted",
        message: `Influencer submitted "${title}" for "${workspace.campaignTitle}"`,
        link: `/workspace/${id}`,
      },
    }).catch(() => {})

    return Response.json(deliverable, { status: 201 })
  } catch (e) {
    console.error("deliverable POST:", e.message)
    return Response.json({ error: "Failed to submit deliverable" }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params

    const workspace = await prisma.campaignWorkspace.findUnique({ where: { id } })
    if (!workspace) return Response.json({ error: "Not found" }, { status: 404 })

    const isBrand = workspace.brandId === session.user.id
    if (!isBrand) return Response.json({ error: "Only brand can review deliverables" }, { status: 403 })

    const influencer = await prisma.influencer.findFirst({
      where: { id: workspace.influencerId },
      select: { userId: true },
    })

    const { deliverableId, status, feedback } = await request.json()
    if (!deliverableId || !status) return Response.json({ error: "deliverableId and status required" }, { status: 400 })

    const deliverable = await prisma.workspaceDeliverable.update({
      where: { id: deliverableId },
      data: {
        status,
        feedback,
        approvedAt: status === "approved" ? new Date() : null,
      },
    })

    if (influencer?.userId) {
      const msg = status === "approved"
        ? `Your deliverable "${deliverable.title}" was approved!`
        : `Revision requested on "${deliverable.title}" for "${workspace.campaignTitle}"`
      prisma.notification.create({
        data: {
          userId: influencer.userId,
          type: "workspace_deliverable",
          title: status === "approved" ? "Deliverable Approved" : "Revision Requested",
          message: msg,
          link: `/workspace/${id}`,
        },
      }).catch(() => {})
    }

    return Response.json(deliverable)
  } catch (e) {
    console.error("deliverable PATCH:", e.message)
    return Response.json({ error: "Failed to update deliverable" }, { status: 500 })
  }
}
