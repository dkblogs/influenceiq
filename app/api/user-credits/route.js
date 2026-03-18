import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        brandVerified: true,
        role: true,
      },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json({
      credits: user.credits,
      brandVerified: user.brandVerified,
      role: user.role,
    })

  } catch (error) {
    console.error("Credits fetch error:", error.message, error.stack)
    return Response.json({ error: "Failed to fetch credits", details: error.message }, { status: 500 })
  }
}
