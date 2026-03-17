import Razorpay from "razorpay"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request) {
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
}