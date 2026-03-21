import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "brand") return Response.json({ error: "Forbidden" }, { status: 403 })

    const unlocked = await prisma.unlockedContact.findMany({
      where: {
        userId: session.user.id,
        expiresAt: { gt: new Date() },
      },
      include: { influencer: true },
      orderBy: { expiresAt: "asc" },
    })

    return Response.json({ unlocked })
  } catch (error) {
    console.error("my-unlocked error:", error.message)
    return Response.json({ error: "Failed to fetch unlocked contacts" }, { status: 500 })
  }
}
