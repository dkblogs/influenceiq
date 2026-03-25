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
      messages: { orderBy: { createdAt: "asc" } },
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
    if (!result.isBrand) return Response.json({ error: "Only brand can update payment" }, { status: 403 })

    const body = await request.json()
    const allowed = ["paymentStatus", "paymentNotes", "status"]
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
