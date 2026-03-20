import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const [campaignApplicationCount, collaborationRequestCount] = await Promise.all([
      prisma.campaignApplication.count({ where: { userId } }),
      prisma.collaborationRequest.count({ where: { fromUserId: userId } }),
    ])

    return Response.json({ campaignApplicationCount, collaborationRequestCount })
  } catch (error) {
    console.error("influencer-stats error:", error.message)
    return Response.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
