import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(request) {
  try {
    const body = await request.json()
    const { credits, plan, razorpay_payment_id, userId } = body

    if (!userId || !credits) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: parseInt(credits) } },
    })

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: "purchase",
        amount: parseInt(credits),
      },
    })

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    return Response.json({
      success: true,
      newCredits: updated.credits,
    })

  } catch (error) {
    console.error("Payment success error:", error.message)
    return Response.json({ error: "Failed to add credits" }, { status: 500 })
  }
}