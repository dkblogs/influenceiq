import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const influencer = await prisma.influencer.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!influencer) {
      return Response.json({ error: "No influencer profile found" }, { status: 404 })
    }

    const reports = await prisma.aiReport.findMany({
      where: { influencerId: influencer.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        score: true,
        summary: true,
        reportFull: true,
        createdAt: true,
      },
    })

    return Response.json({ reports })
  } catch (error) {
    console.error("AI reports GET error:", error.message)
    return Response.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
