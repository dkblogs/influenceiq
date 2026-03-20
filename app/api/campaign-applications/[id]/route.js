import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, applicationStatusEmail } from "@/lib/email"

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const { status } = await request.json()

    if (!["accepted", "rejected"].includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 })
    }

    // Load application with campaign
    const application = await prisma.campaignApplication.findUnique({
      where: { id },
      include: { campaign: { select: { id: true, title: true, brandId: true } } },
    })
    if (!application) {
      return Response.json({ error: "Application not found" }, { status: 404 })
    }
    if (application.campaign.brandId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get brand name + influencer user email
    const [brandUser, influencerUser, influencer] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, companyName: true },
      }),
      prisma.user.findUnique({
        where: { id: application.userId },
        select: { email: true },
      }),
      prisma.influencer.findFirst({
        where: { userId: application.userId },
        select: { name: true },
      }),
    ])

    const brandName = brandUser?.companyName || brandUser?.name || "The brand"
    const influencerName = influencer?.name || "Influencer"
    const campaignTitle = application.campaign.title

    // Update application status
    const updated = await prisma.campaignApplication.update({
      where: { id },
      data: { status },
    })

    // Create in-app notification for influencer
    const accepted = status === "accepted"
    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: accepted ? "application_accepted" : "application_rejected",
        title: accepted ? "🎉 Application Accepted!" : "Application Update",
        message: accepted
          ? `Your application for "${campaignTitle}" has been accepted by ${brandName}`
          : `Your application for "${campaignTitle}" was not selected this time`,
        link: "/dashboard/campaigns-applied",
      },
    })

    // Send email to influencer (fire-and-forget)
    if (influencerUser?.email) {
      const emailTemplate = applicationStatusEmail({ influencerName, campaignTitle, brandName, accepted })
      sendEmail({ to: influencerUser.email, subject: emailTemplate.subject, html: emailTemplate.html }).catch(() => {})
    }

    return Response.json({ application: updated })
  } catch (error) {
    console.error("Campaign application PATCH error:", error.message)
    return Response.json({ error: "Failed to update application" }, { status: 500 })
  }
}
