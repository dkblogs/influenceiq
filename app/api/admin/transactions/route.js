import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const transactions = await prisma.creditTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return Response.json({ transactions })
  } catch (error) {
    console.error("Admin transactions error:", error.message)
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}