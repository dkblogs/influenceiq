import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function checkAccess(session, proposalId) {
  const proposal = await prisma.proposal.findUnique({ where: { id: proposalId }, select: { brandId: true, influencerId: true } })
  if (!proposal) return null
  const influencer = await prisma.influencer.findFirst({ where: { id: proposal.influencerId }, select: { userId: true } })
  const isBrand = proposal.brandId === session.user.id
  const isInfluencer = influencer?.userId === session.user.id
  if (!isBrand && !isInfluencer) return null
  return { proposal, role: isBrand ? "brand" : "influencer" }
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params
    const access = await checkAccess(session, id)
    if (!access) return Response.json({ error: "Forbidden" }, { status: 403 })

    const messages = await prisma.proposalMessage.findMany({
      where: { proposalId: id },
      orderBy: { createdAt: "asc" },
    })
    return Response.json({ messages })
  } catch (e) {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params
    const access = await checkAccess(session, id)
    if (!access) return Response.json({ error: "Forbidden" }, { status: 403 })

    const { message } = await request.json()
    if (!message?.trim()) return Response.json({ error: "Message required" }, { status: 400 })

    const msg = await prisma.proposalMessage.create({
      data: {
        proposalId: id,
        senderId: session.user.id,
        senderRole: access.role,
        message: message.trim(),
      },
    })
    return Response.json({ message: msg })
  } catch (e) {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
