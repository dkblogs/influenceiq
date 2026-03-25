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
    const isBrand = workspace.brandId === session.user.id
    const isInfluencer = influencer?.userId === session.user.id
    if (!isBrand && !isInfluencer) return Response.json({ error: "Forbidden" }, { status: 403 })

    const { message } = await request.json()
    if (!message?.trim()) return Response.json({ error: "message required" }, { status: 400 })

    const msg = await prisma.workspaceMessage.create({
      data: {
        workspaceId: id,
        senderId: session.user.id,
        senderRole: isBrand ? "brand" : "influencer",
        message: message.trim(),
      },
    })

    return Response.json(msg, { status: 201 })
  } catch (e) {
    console.error("workspace message POST:", e.message)
    return Response.json({ error: "Failed to send message" }, { status: 500 })
  }
}
