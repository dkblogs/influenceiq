import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, applicationReceivedEmail } from "@/lib/email"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "influencer") {
      return Response.json({ error: "Only influencers can apply to campaigns" }, { status: 403 })
    }

    const body = await request.json()
    const { campaignId, userId } = body

    if (!userId || !campaignId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    if (user.credits < 2) {
      return Response.json({ error: "Insufficient credits", redirectTo: "/pricing" }, { status: 402 })
    }

    const existing = await prisma.campaignApplication.findUnique({
      where: {
        campaignId_userId: { campaignId, userId },
      },
    })

    if (existing) {
      return Response.json({ error: "You have already applied to this campaign." }, { status: 400 })
    }

    // Fetch campaign + influencer profile in parallel
    const [campaign, influencer] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { title: true, brandId: true },
      }),
      prisma.influencer.findFirst({
        where: { userId },
        select: { name: true },
      }),
    ])

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 2 } },
    })

    await prisma.campaignApplication.create({
      data: { campaignId, userId },
    })

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: "campaign_application",
        amount: -2,
      },
    })

    // Notify brand + send email (fire-and-forget)
    if (campaign) {
      const influencerName = influencer?.name || user.name || "An influencer"
      const campaignTitle = campaign.title

      prisma.notification.create({
        data: {
          userId: campaign.brandId,
          type: "application_received",
          title: "New Campaign Application",
          message: `${influencerName} applied to your campaign "${campaignTitle}"`,
          link: "/my-campaigns",
        },
      }).catch(() => {})

      // Get brand email for notification
      prisma.user.findUnique({
        where: { id: campaign.brandId },
        select: { email: true, name: true, companyName: true },
      }).then(brandUser => {
        if (brandUser?.email) {
          const emailTemplate = applicationReceivedEmail({
            brandName: brandUser.companyName || brandUser.name || "there",
            influencerName,
            campaignTitle,
          })
          sendEmail({ to: brandUser.email, subject: emailTemplate.subject, html: emailTemplate.html }).catch(() => {})
        }
      }).catch(() => {})
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    return Response.json({
      success: true,
      newCredits: updatedUser.credits,
    })

  } catch (error) {
    console.error("Apply campaign error:", error.message)
    return Response.json({ error: "Failed to apply" }, { status: 500 })
  }
}
