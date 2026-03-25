import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function getWorkspaceAndCheck(id, userId) {
  const workspace = await prisma.campaignWorkspace.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { order: "asc" } },
      deliverables: { orderBy: { createdAt: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
      proposal: {
        select: {
          id: true,
          status: true,
          contentType: true,
          description: true,
          deliverables: true,
          remuneration: true,
          timeline: true,
          revisions: true,
          messages: { orderBy: { createdAt: "asc" } },
          brand: { select: { id: true, name: true, companyName: true } },
          influencer: { select: { id: true, name: true, handle: true } },
        },
      },
    },
  })
  if (!workspace) return null

  const influencer = await prisma.influencer.findFirst({
    where: { id: workspace.influencerId },
    select: { userId: true },
  })

  const isBrand = workspace.brandId === userId
  const isInfluencer = influencer?.userId === userId
  if (!isBrand && !isInfluencer) return null

  return { workspace, isBrand, isInfluencer, influencerUserId: influencer?.userId }
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params

    const result = await getWorkspaceAndCheck(id, session.user.id)
    if (!result) return Response.json({ error: "Not found" }, { status: 404 })

    return Response.json({ ...result.workspace, isBrand: result.isBrand })
  } catch (e) {
    console.error("workspace GET:", e.message)
    return Response.json({ error: "Failed to load workspace" }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params

    const result = await getWorkspaceAndCheck(id, session.user.id)
    if (!result) return Response.json({ error: "Not found" }, { status: 404 })

    const { workspace, isBrand, isInfluencer, influencerUserId } = result
    const body = await request.json()

    // Action: brand marks payment sent
    if (body.action === "payment_sent") {
      if (!isBrand) return Response.json({ error: "Only brand can mark payment sent" }, { status: 403 })
      const updated = await prisma.campaignWorkspace.update({
        where: { id },
        data: { paymentStatus: "sent", paymentSentAt: new Date(), updatedAt: new Date() },
      })
      if (influencerUserId) {
        prisma.notification.create({
          data: {
            userId: influencerUserId,
            type: "workspace_payment",
            title: "💸 Payment Sent",
            message: `Brand has marked payment as sent for "${workspace.campaignTitle}"`,
            link: `/workspace/${id}`,
          },
        }).catch(() => {})
      }
      return Response.json(updated)
    }

    // Action: influencer confirms payment received
    if (body.action === "payment_confirmed") {
      if (!isInfluencer) return Response.json({ error: "Only influencer can confirm payment" }, { status: 403 })
      const updated = await prisma.campaignWorkspace.update({
        where: { id },
        data: { paymentStatus: "confirmed", paymentConfirmedAt: new Date(), updatedAt: new Date() },
      })
      // Auto-mark the Payment / Campaign Complete milestone
      const paymentMilestone = workspace.milestones.find(m =>
        m.title.toLowerCase().includes("payment") || m.title.toLowerCase().includes("campaign complete")
      )
      if (paymentMilestone && paymentMilestone.status !== "completed") {
        await prisma.workspaceMilestone.update({
          where: { id: paymentMilestone.id },
          data: { status: "completed", completedAt: new Date() },
        })
      }
      prisma.notification.create({
        data: {
          userId: workspace.brandId,
          type: "workspace_payment",
          title: "✅ Payment Confirmed",
          message: `Influencer confirmed payment received for "${workspace.campaignTitle}"`,
          link: `/workspace/${id}`,
        },
      }).catch(() => {})
      return Response.json(updated)
    }

    // Generic field update (brand only for paymentNotes/status)
    if (!isBrand) return Response.json({ error: "Only brand can update workspace" }, { status: 403 })
    const allowed = ["paymentNotes", "status"]
    const data = {}
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    const updated = await prisma.campaignWorkspace.update({ where: { id }, data: { ...data, updatedAt: new Date() } })
    return Response.json(updated)
  } catch (e) {
    console.error("workspace PATCH:", e.message)
    return Response.json({ error: "Failed to update workspace" }, { status: 500 })
  }
}
