import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, counterProposalEmail } from "@/lib/email"

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

    const body = await request.json()
    const { remunerationCounter, deliverablesCounter, timelineCounter, revisionsCounter, notes } = body

    const lastRound = proposal.rounds[0]
    const nextRoundNumber = (lastRound?.roundNumber ?? 0) + 1
    const submittedBy = isInfluencer ? "influencer" : "brand"

    // Create new round and set proposal to negotiating
    const [round] = await prisma.$transaction([
      prisma.proposalRound.create({
        data: {
          proposalId: id,
          roundNumber: nextRoundNumber,
          submittedBy,
          remunerationCounter: remunerationCounter || null,
          deliverablesCounter: deliverablesCounter || null,
          timelineCounter: timelineCounter || null,
          revisionsCounter: revisionsCounter ?? null,
          notes: notes || null,
          status: "pending",
        },
      }),
      prisma.proposal.update({ where: { id }, data: { status: "negotiating" } }),
    ])

    // Notify the other party
    const brand = await prisma.user.findUnique({ where: { id: proposal.brandId }, select: { name: true, companyName: true, email: true } })
    const brandName = brand?.companyName || brand?.name || "Brand"
    const influencerName = influencer?.name || "Influencer"

    if (submittedBy === "influencer") {
      // Notify brand
      prisma.notification.create({
        data: {
          userId: proposal.brandId,
          type: "proposal_countered",
          title: "Counter Proposal Received",
          message: `${influencerName} sent a counter proposal for "${proposal.campaignTitle}"`,
          link: `/proposals/${id}`,
        },
      }).catch(() => {})

      if (brand?.email) {
        const tpl = counterProposalEmail({ recipientName: brandName, senderName: influencerName, campaignTitle: proposal.campaignTitle, proposalId: id, remunerationCounter, timelineCounter, notes })
        sendEmail({ to: brand.email, subject: tpl.subject, html: tpl.html }).catch(() => {})
      }
    } else {
      // Notify influencer
      if (influencer?.userId) {
        prisma.notification.create({
          data: {
            userId: influencer.userId,
            type: "proposal_countered",
            title: "Revised Proposal Received",
            message: `${brandName} sent a revised proposal for "${proposal.campaignTitle}"`,
            link: `/proposals/${id}`,
          },
        }).catch(() => {})

        prisma.user.findUnique({ where: { id: influencer.userId }, select: { email: true } }).then(infUser => {
          if (infUser?.email) {
            const tpl = counterProposalEmail({ recipientName: influencerName, senderName: brandName, campaignTitle: proposal.campaignTitle, proposalId: id, remunerationCounter, timelineCounter, notes })
            sendEmail({ to: infUser.email, subject: tpl.subject, html: tpl.html }).catch(() => {})
          }
        }).catch(() => {})
      }
    }

    return Response.json({ success: true, round })
  } catch (e) {
    console.error("counter POST:", e.message)
    return Response.json({ error: "Failed to submit counter" }, { status: 500 })
  }
}
