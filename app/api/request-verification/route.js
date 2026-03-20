import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getInfluencerForUser } from "@/lib/getInfluencerForUser"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "influencer") {
    return Response.json({ error: "Only influencers can request verification" }, { status: 403 })
  }

  const influencer = await getInfluencerForUser({ userId: session.user.id, email: session.user.email })
  if (!influencer) {
    return Response.json({ error: "Influencer profile not found" }, { status: 404 })
  }

  if (influencer.verified) {
    return Response.json({ verified: true, message: "Your profile is already verified." })
  }

  const missing = []
  if (!influencer.instagramVerified && !influencer.youtubeVerified) missing.push("handle verification")
  if (!influencer.aiReportGeneratedAt) missing.push("AI report")

  if (missing.length > 0) {
    return Response.json({ verified: false, missing })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.credits < 20) {
    return Response.json(
      { error: "Not enough credits. You need 20 credits to get verified.", redirectTo: "/pricing" },
      { status: 402 }
    )
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 20 } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount: -20,
        type: "verification_badge",
      },
    }),
    prisma.influencer.update({
      where: { id: influencer.id },
      data: { verified: true },
    }),
  ])

  return Response.json({ verified: true, message: "Congratulations! Your profile is now verified." })
}
