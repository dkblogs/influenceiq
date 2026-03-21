import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "brand") return Response.json({ error: "Forbidden" }, { status: 403 })

  const userId = session.user.id

  const [proposalCount, aiReportCount, unlockedCount] = await Promise.all([
    prisma.proposal.count({ where: { brandId: userId } }),
    prisma.creditTransaction.count({ where: { userId, type: { contains: "ai_report" } } }),
    prisma.unlockedContact.count({ where: { userId, expiresAt: { gt: new Date() } } }),
  ])

  return Response.json({ proposalCount, aiReportCount, unlockedCount })
}
