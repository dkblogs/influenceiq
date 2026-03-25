import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { brandId: true, influencerId: true, workspace: { select: { id: true } } },
    })
    if (!proposal) return Response.json({ error: "Not found" }, { status: 404 })

    const influencer = await prisma.influencer.findFirst({
      where: { id: proposal.influencerId },
      select: { userId: true },
    })
    const isBrand = proposal.brandId === session.user.id
    const isInfluencer = influencer?.userId === session.user.id
    if (!isBrand && !isInfluencer) return Response.json({ error: "Forbidden" }, { status: 403 })

    return Response.json({ workspaceId: proposal.workspace?.id || null })
  } catch (e) {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
