import Razorpay from "razorpay"
import { checkRateLimit, LIMITS } from "@/lib/withRateLimit"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request) {
  try {
    const rl = await checkRateLimit(LIMITS.payment, "payment")
    if (rl) return rl

    const body = await request.json()
    const { amount, credits, plan } = body

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { credits, plan },
    })

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Payment error:", error)
    return Response.json({ error: "Payment failed" }, { status: 500 })
  }
}
