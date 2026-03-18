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
        brandVerified: true,
        createdAt: true,
      },
    })
    return Response.json({ users })
  } catch (error) {
    console.error("Admin users error:", error.message)
    return Response.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { id, brandVerified } = await request.json()
    const updated = await prisma.user.update({
      where: { id },
      data: {
        brandVerified,
        brandVerifiedAt: brandVerified ? new Date() : null,
      },
    })
    return Response.json({ success: true, brandVerified: updated.brandVerified })
  } catch (error) {
    console.error("Admin users PATCH error:", error.message)
    return Response.json({ error: "Failed to update user" }, { status: 500 })
  }
}
