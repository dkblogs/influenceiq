import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const brands = await prisma.user.findMany({
      where: { role: "brand" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        brandVerified: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return Response.json({ brands })
  } catch (error) {
    console.error("Brands GET error:", error.message)
    return Response.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}
