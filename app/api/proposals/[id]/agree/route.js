import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, proposalAgreedEmail } from "@/lib/email"

export async function POST(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { rounds: { orderBy: { roundNumber: "desc" }, take: 1 } },
    })
    if (!proposal) return Response.json({ error: "Not found" }, { status: 404 })

    const influencer = await prisma.influencer.findFirst({ where: { id: proposal.influencerId }, select: { userId: true, name: true } })
    const isBrand = proposal.brandId === session.user.id
    const isInfluencer = influencer?.userId === session.user.id
    if (!isBrand && !isInfluencer) return Response.json({ error: "Forbidden" }, { status: 403 })

    // Mark latest round accepted and proposal agreed
    const latestRound = proposal.rounds[0]
    await prisma.$transaction([
      latestRound
        ? prisma.proposalRound.update({ where: { id: latestRound.id }, data: { status: "accepted" } })
        : prisma.proposalRound.updateMany({ where: { proposalId: id }, data: { status: "accepted" } }),
      prisma.proposal.update({ where: { id }, data: { status: "agreed" } }),
    ])

    const brand = await prisma.user.findUnique({ where: { id: proposal.brandId }, select: { name: true, companyName: true, email: true } })
    const brandName = brand?.companyName || brand?.name || "Brand"
    const influencerName = influencer?.name || "Influencer"

    // Final remuneration: from latest round counter if set, else original
    const finalRemuneration = latestRound?.remunerationCounter || proposal.remuneration
    const finalTimeline = latestRound?.timelineCounter || proposal.timeline

    // Notify both parties
    const notifications = [
      { userId: proposal.brandId, message: `${influencerName} agreed to your proposal for "${proposal.campaignTitle}"` },
    ]
    if (influencer?.userId) {
      notifications.push({ userId: influencer.userId, message: `${brandName} — proposal for "${proposal.campaignTitle}" is agreed!` })
    }
    for (const n of notifications) {
      prisma.notification.create({
        data: {
          userId: n.userId,
          type: "proposal_agreed",
          title: "🎉 Proposal Agreed!",
          message: n.message,
          link: `/proposals/${id}`,
        },
      }).catch(() => {})
    }

    // Emails to both
    const emailData = { campaignTitle: proposal.campaignTitle, finalRemuneration, finalTimeline, proposalId: id }
    if (brand?.email) {
      const tpl = proposalAgreedEmail({ recipientName: brandName, otherPartyName: influencerName, ...emailData })
      sendEmail({ to: brand.email, subject: tpl.subject, html: tpl.html }).catch(() => {})
    }
    if (influencer?.userId) {
      prisma.user.findUnique({ where: { id: influencer.userId }, select: { email: true } }).then(infUser => {
        if (infUser?.email) {
          const tpl = proposalAgreedEmail({ recipientName: influencerName, otherPartyName: brandName, ...emailData })
          sendEmail({ to: infUser.email, subject: tpl.subject, html: tpl.html }).catch(() => {})
        }
      }).catch(() => {})
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error("agree POST:", e.message)
    return Response.json({ error: "Failed to agree" }, { status: 500 })
  }
}
