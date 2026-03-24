import { prisma } from "@/lib/prisma"
import { sendEmail, paymentConfirmationEmail } from "@/lib/email"

const PLAN_CREDITS = { Starter: 100, Growth: 400, Agency: 1200 }

export async function POST(request) {
  try {
    const body = await request.json()
    const { plan, razorpay_payment_id, userId } = body

    if (!userId || !plan) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const creditsToAdd = PLAN_CREDITS[plan]
    if (!creditsToAdd) {
      return Response.json({ error: "Invalid plan" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: creditsToAdd } },
    })

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: `purchase_${plan.toLowerCase()}`,
        amount: creditsToAdd,
      },
    })

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, credits: true },
    })

    const template = paymentConfirmationEmail({
      name: updated.name,
      plan: plan || "Credits",
      credits: creditsToAdd,
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