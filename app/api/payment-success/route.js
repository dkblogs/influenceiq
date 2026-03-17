import { prisma } from "@/lib/prisma"
import { sendEmail, paymentConfirmationEmail } from "@/lib/email"

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
      select: { name: true, email: true, credits: true },
    })

    const template = paymentConfirmationEmail({
      name: updated.name,
      plan: plan || "Credits",
      credits: parseInt(credits),
      newTotal: updated.credits,
      paymentId: razorpay_payment_id || "N/A",
    })
    sendEmail({ to: updated.email, subject: template.subject, html: template.html })

    return Response.json({
      success: true,
      newCredits: updated.credits,
    })

  } catch (error) {
    console.error("Payment success error:", error.message)
    return Response.json({ error: "Failed to add credits" }, { status: 500 })
  }
}