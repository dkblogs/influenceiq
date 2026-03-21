import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { proposalMessageEmail, sendEmail } from "@/lib/email"

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

    // Notify the other party (fire-and-forget)
    ;(async () => {
      try {
        const proposal = await prisma.proposal.findUnique({
          where: { id },
          select: {
            campaignTitle: true,
            brandId: true,
            influencer: { select: { userId: true } },
          },
        })
        if (!proposal) return

        const senderRole = access.role
        const recipientId = senderRole === "brand" ? proposal.influencer.userId : proposal.brandId
        if (!recipientId) return

        const messagePreview = message.trim().slice(0, 60) + (message.trim().length > 60 ? "..." : "")

        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "proposal_message",
            title: senderRole === "brand" ? "💬 New message from brand" : "💬 New message from influencer",
            message: `New message on proposal "${proposal.campaignTitle}": "${messagePreview}"`,
            link: `/proposals/${id}`,
          },
        })

        const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { name: true, email: true } })
        if (recipient?.email) {
          const emailData = proposalMessageEmail({
            recipientName: recipient.name || "there",
            senderRole,
            campaignTitle: proposal.campaignTitle,
            messagePreview,
            proposalId: id,
          })
          await sendEmail({ to: recipient.email, subject: emailData.subject, html: emailData.html })
        }
      } catch (e) {
        console.error("[messages] notify error:", e)
      }
    })()

    return Response.json({ message: msg })
  } catch (e) {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
