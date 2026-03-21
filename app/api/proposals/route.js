import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, proposalReceivedEmail } from "@/lib/email"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")

    const role = session.user.role

    if (role === "brand") {
      const where = { brandId: session.user.id }
      if (statusFilter) where.status = statusFilter

      const proposals = await prisma.proposal.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: { rounds: { orderBy: { roundNumber: "desc" }, take: 1 } },
      })
      const influencerIds = proposals.map(p => p.influencerId)
      const influencers = await prisma.influencer.findMany({
        where: { id: { in: influencerIds } },
        select: { id: true, name: true, initials: true, niche: true, niches: true, platform: true, platforms: true, location: true, verified: true },
      })
      const infMap = Object.fromEntries(influencers.map(i => [i.id, i]))
      return Response.json({
        proposals: proposals.map(p => ({
          ...p,
          influencer: infMap[p.influencerId] ?? null,
          influencerName: infMap[p.influencerId]?.name ?? "Influencer",
          influencerInitials: infMap[p.influencerId]?.initials ?? "??",
          latestRound: p.rounds[0] ?? null,
        })),
      })
    }

    // influencer
    const influencer = await prisma.influencer.findFirst({ where: { userId: session.user.id } })
    if (!influencer) return Response.json({ proposals: [] })

    const proposals = await prisma.proposal.findMany({
      where: { influencerId: influencer.id },
      orderBy: { updatedAt: "desc" },
      include: { rounds: { orderBy: { roundNumber: "desc" }, take: 1 } },
    })
    const brandIds = proposals.map(p => p.brandId)
    const brands = await prisma.user.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true, companyName: true },
    })
    const brandMap = Object.fromEntries(brands.map(b => [b.id, b]))
    return Response.json({
      proposals: proposals.map(p => ({
        ...p,
        brandName: brandMap[p.brandId]?.companyName || brandMap[p.brandId]?.name || "Brand",
        latestRound: p.rounds[0] ?? null,
      })),
    })
  } catch (e) {
    console.error("proposals GET:", e.message)
    return Response.json({ error: "Failed to fetch proposals" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "brand") return Response.json({ error: "Only brands can send proposals" }, { status: 403 })

    const body = await request.json()
    const {
      influencerId, campaignTitle, contentType, description, deliverables,
      location, timeline, startDate, endDate, remuneration, remunerationDetails,
      exclusivity, revisions, additionalTerms,
    } = body

    if (!influencerId || !campaignTitle || !contentType || !description || !deliverables || !timeline || !remuneration) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const brand = await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true, name: true, companyName: true } })
    if (!brand || brand.credits < 10) {
      return Response.json({ error: "Insufficient credits", redirectTo: "/pricing" }, { status: 402 })
    }

    const influencer = await prisma.influencer.findFirst({ where: { id: influencerId }, select: { id: true, name: true, userId: true } })
    if (!influencer) return Response.json({ error: "Influencer not found" }, { status: 404 })

    await prisma.user.update({ where: { id: session.user.id }, data: { credits: { decrement: 10 } } })
    await prisma.creditTransaction.create({ data: { userId: session.user.id, type: "proposal_sent", amount: -10 } })

    const proposal = await prisma.proposal.create({
      data: {
        brandId: session.user.id,
        influencerId,
        campaignTitle,
        contentType,
        description,
        deliverables,
        location: location || null,
        timeline,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        remuneration,
        remunerationDetails: remunerationDetails || null,
        exclusivity: exclusivity ?? false,
        revisions: revisions ?? 2,
        additionalTerms: additionalTerms || null,
        rounds: {
          create: {
            roundNumber: 1,
            submittedBy: "brand",
            status: "pending",
          },
        },
      },
    })

    const brandName = brand.companyName || brand.name || "A brand"

    // Notification for influencer
    if (influencer.userId) {
      prisma.notification.create({
        data: {
          userId: influencer.userId,
          type: "proposal_received",
          title: "New Collaboration Proposal",
          message: `${brandName} sent you a proposal for "${campaignTitle}"`,
          link: `/proposals/${proposal.id}`,
        },
      }).catch(() => {})

      // Email
      prisma.user.findUnique({ where: { id: influencer.userId }, select: { email: true } }).then(infUser => {
        if (infUser?.email) {
          const tpl = proposalReceivedEmail({ influencerName: influencer.name, brandName, campaignTitle, proposalId: proposal.id, remuneration, timeline, contentType })
          sendEmail({ to: infUser.email, subject: tpl.subject, html: tpl.html }).catch(() => {})
        }
      }).catch(() => {})
    }

    const updatedBrand = await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } })
    return Response.json({ success: true, proposalId: proposal.id, newCredits: updatedBrand.credits })
  } catch (e) {
    console.error("proposals POST:", e.message)
    return Response.json({ error: "Failed to create proposal" }, { status: 500 })
  }
}
