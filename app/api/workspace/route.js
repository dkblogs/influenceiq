import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { proposalId } = await request.json()
    if (!proposalId) return Response.json({ error: "proposalId required" }, { status: 400 })

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { rounds: { orderBy: { roundNumber: "desc" }, take: 1 } },
    })
    if (!proposal) return Response.json({ error: "Proposal not found" }, { status: 404 })
    if (proposal.status !== "agreed") return Response.json({ error: "Proposal must be agreed" }, { status: 400 })

    const influencer = await prisma.influencer.findFirst({
      where: { id: proposal.influencerId },
      select: { userId: true },
    })

    const isBrand = proposal.brandId === session.user.id
    const isInfluencer = influencer?.userId === session.user.id
    if (!isBrand && !isInfluencer) return Response.json({ error: "Forbidden" }, { status: 403 })

    // Return existing workspace if it exists
    const existing = await prisma.campaignWorkspace.findUnique({ where: { proposalId } })
    if (existing) return Response.json(existing)

    const latestRound = proposal.rounds[0]
    const finalRemuneration = latestRound?.remunerationCounter || proposal.remuneration

    const workspace = await prisma.campaignWorkspace.create({
      data: {
        proposalId,
        brandId: proposal.brandId,
        influencerId: proposal.influencerId,
        campaignTitle: proposal.campaignTitle,
        paymentAmount: finalRemuneration,
        milestones: {
          create: [
            { title: "Campaign Kickoff", description: "Brief alignment, assets shared, creative direction confirmed", order: 1 },
            { title: "Content Planning", description: "Content plan, shoot dates, and script/outline submitted", order: 2 },
            { title: "Content Creation", description: "Raw content created and ready for review", order: 3 },
            { title: "Content Review", description: "Brand reviews and approves the content", order: 4 },
            { title: "Content Goes Live", description: "Post published on agreed platforms", order: 5 },
            { title: "Campaign Complete", description: "Final analytics and results submitted", order: 6 },
          ],
        },
      },
      include: { milestones: { orderBy: { order: "asc" } } },
    })

    return Response.json(workspace, { status: 201 })
  } catch (e) {
    console.error("workspace POST:", e.message)
    return Response.json({ error: "Failed to create workspace" }, { status: 500 })
  }
}
