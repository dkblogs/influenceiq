import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        createdAt: true,
      },
    })
    return Response.json({ users })
  } catch (error) {
    console.error("Admin users error:", error.message)
    return Response.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}