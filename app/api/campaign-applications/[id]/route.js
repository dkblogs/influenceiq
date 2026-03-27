import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, applicationAcceptedEmail, applicationRejectedEmail } from "@/lib/email"

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

    // Load application with full campaign details
    const application = await prisma.campaignApplication.findUnique({
      where: { id },
      include: { campaign: true },
    })
    if (!application) {
      return Response.json({ error: "Application not found" }, { status: 404 })
    }
    if (application.campaign.brandId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get influencer record and user email (CampaignApplication has userId, not influencer relation)
    const [influencer, influencerUser] = await Promise.all([
      prisma.influencer.findFirst({
        where: { userId: application.userId },
        select: { id: true, name: true, userId: true },
      }),
      prisma.user.findUnique({
        where: { id: application.userId },
        select: { email: true },
      }),
    ])

    if (!influencer) {
      return Response.json({ error: "Influencer profile not found for this user" }, { status: 404 })
    }

    const influencerName = influencer.name || "Influencer"
    const campaignTitle = application.campaign.title

    // 1. Update application status
    const updated = await prisma.campaignApplication.update({
      where: { id },
      data: { status },
    })

    if (status === "accepted") {
      // 2. Auto-create Proposal from campaign details
      const proposal = await prisma.proposal.create({
        data: {
          brandId: application.campaign.brandId,
          influencerId: influencer.id,
          status: "agreed",
          campaignTitle,
          contentType: application.campaign.platform || "Multiple Deliverables",
          description: application.campaign.description || "",
          deliverables: application.campaign.requirements || "",
          location: application.campaign.location || "Remote",
          timeline: application.campaign.deadline
            ? `Until ${new Date(application.campaign.deadline).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`
            : "To be discussed",
          remuneration: application.campaign.budget || "To be discussed",
          exclusivity: false,
          revisions: 2,
        },
      })

      // 3. Auto-create workspace with 6 milestones (campaignTitle is required)
      const workspace = await prisma.campaignWorkspace.create({
        data: {
          proposalId: proposal.id,
          brandId: application.campaign.brandId,
          influencerId: influencer.id,
          campaignTitle,
          paymentAmount: application.campaign.budget || null,
          milestones: {
            create: [
              { title: "Content Draft", description: "Influencer submits first content draft", order: 1 },
              { title: "Brand Review", description: "Brand reviews and provides feedback", order: 2 },
              { title: "Revisions", description: "Influencer makes requested changes", order: 3 },
              { title: "Final Content", description: "Influencer submits final approved content", order: 4 },
              { title: "Delivery Confirmation", description: "Brand confirms content delivery", order: 5 },
              { title: "Payment", description: "Brand sends payment, influencer confirms receipt", order: 6 },
            ],
          },
        },
      })

      // 4. Auto-unlock contact for brand
      await prisma.unlockedContact.upsert({
        where: {
          userId_influencerId: {
            userId: application.campaign.brandId,
            influencerId: influencer.id,
          },
        },
        create: {
          userId: application.campaign.brandId,
          influencerId: influencer.id,
          unlockedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        update: {
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      })

      // 5. Notify influencer — link directly to workspace
      await prisma.notification.create({
        data: {
          userId: influencer.userId,
          type: "application_accepted",
          title: "🎉 Your application was accepted!",
          message: `${campaignTitle} — Your application has been accepted. Your workspace is ready!`,
          link: `/workspace/${workspace.id}`,
        },
      })

      // 6. Send acceptance email (fire-and-forget)
      if (influencerUser?.email) {
        sendEmail({
          to: influencerUser.email,
          ...applicationAcceptedEmail({
            influencerName,
            campaignTitle,
            workspaceUrl: `${process.env.NEXTAUTH_URL}/workspace/${workspace.id}`,
          }),
        }).catch(() => {})
      }

      return Response.json({ application: updated, workspaceId: workspace.id })
    } else {
      // Rejected: notify influencer
      await prisma.notification.create({
        data: {
          userId: influencer.userId,
          type: "application_rejected",
          title: "Application Update",
          message: `Your application for "${campaignTitle}" was not selected this time. Keep applying!`,
          link: "/campaigns",
        },
      })

      if (influencerUser?.email) {
        sendEmail({
          to: influencerUser.email,
          ...applicationRejectedEmail({ influencerName, campaignTitle }),
        }).catch(() => {})
      }

      return Response.json({ application: updated })
    }
  } catch (error) {
    console.error("Campaign application PATCH error:", error.message, error.stack)
    return Response.json({ error: "Failed to update application", detail: error.message }, { status: 500 })
  }
}
