import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    })
    return Response.json({ campaigns })
  } catch (error) {
    console.error("Admin campaigns error:", error.message)
    return Response.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}