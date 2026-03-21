import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function loadProposal(id) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      rounds: { orderBy: { roundNumber: "asc" } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  })
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params
    const proposal = await loadProposal(id)
    if (!proposal) return Response.json({ error: "Not found" }, { status: 404 })

    // Check access: brand owner or influencer owner
    const influencer = proposal.influencerId
      ? await prisma.influencer.findFirst({ where: { id: proposal.influencerId }, select: { userId: true, name: true, initials: true } })
      : null
    const isOwner = proposal.brandId === session.user.id || influencer?.userId === session.user.id
    if (!isOwner) return Response.json({ error: "Forbidden" }, { status: 403 })

    const brand = await prisma.user.findUnique({ where: { id: proposal.brandId }, select: { name: true, companyName: true } })

    return Response.json({
      proposal: {
        ...proposal,
        brandName: brand?.companyName || brand?.name || "Brand",
        influencerName: influencer?.name ?? "Influencer",
        influencerInitials: influencer?.initials ?? "??",
      },
    })
  } catch (e) {
    console.error("proposal GET:", e.message)
    return Response.json({ error: "Failed to fetch proposal" }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params
    const { status } = await request.json()

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) return Response.json({ error: "Not found" }, { status: 404 })

    const influencer = await prisma.influencer.findFirst({ where: { id: proposal.influencerId }, select: { userId: true } })
    const isBrand = proposal.brandId === session.user.id
    const isInfluencer = influencer?.userId === session.user.id
    if (!isBrand && !isInfluencer) return Response.json({ error: "Forbidden" }, { status: 403 })

    // Guard allowed transitions
    const allowed = {
      brand: ["withdrawn"],
      influencer: ["rejected"],
    }
    const role = isBrand ? "brand" : "influencer"
    if (!allowed[role].includes(status)) {
      return Response.json({ error: "Status transition not allowed" }, { status: 400 })
    }

    const updated = await prisma.proposal.update({ where: { id }, data: { status } })
    return Response.json({ proposal: updated })
  } catch (e) {
    console.error("proposal PATCH:", e.message)
    return Response.json({ error: "Failed to update proposal" }, { status: 500 })
  }
}
