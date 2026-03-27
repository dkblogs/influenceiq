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

    // Load application with campaign (CampaignApplication has no influencer relation in schema)
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

    // Fetch influencer record and email separately (no relation on CampaignApplication)
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

    const campaignTitle = application.campaign.title
    const influencerName = influencer?.name || "Influencer"

    // Step 1 — Update status (must succeed, outer catch handles failure)
    const updated = await prisma.campaignApplication.update({
      where: { id },
      data: { status },
    })

    if (status === "accepted") {
      let workspaceId = null

      // Step 2 — Create proposal + workspace (non-fatal if fails)
      try {
        if (!influencer) throw new Error("Influencer profile not found for userId: " + application.userId)

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

        console.log("Creating workspace with data:", JSON.stringify({
          proposalId: proposal.id,
          brandId: application.campaign.brandId,
          influencerId: influencer.id,
          campaignTitle: application.campaign.title,
          paymentAmount: application.campaign.budget,
        }))
        const workspace = await prisma.campaignWorkspace.create({
          data: {
            proposalId: proposal.id,
            brandId: application.campaign.brandId,
            influencerId: influencer.id,
            campaignTitle,
            paymentAmount: application.campaign.budget || "",
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
        workspaceId = workspace.id
        console.log("Workspace created:", workspaceId)
      } catch (wsError) {
        console.error("Workspace creation failed:", wsError.message)
        console.error("Full error:", JSON.stringify(wsError, null, 2))
        console.error("Stack:", wsError.stack)
      }

      // Step 3 — Unlock contact (non-fatal if fails)
      try {
        if (influencer) {
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
        }
      } catch (unlockError) {
        console.error("Contact unlock failed (non-fatal):", unlockError.message)
      }

      // Step 4 — Send notification (non-fatal if fails)
      try {
        if (influencer?.userId) {
          await prisma.notification.create({
            data: {
              userId: influencer.userId,
              type: "application_accepted",
              title: "🎉 Your application was accepted!",
              message: `${campaignTitle} — Your application has been accepted. Your workspace is ready!`,
              link: workspaceId ? `/workspace/${workspaceId}` : "/workspaces",
            },
          })
        } else {
          console.error("Could not find influencer userId for notification")
        }
      } catch (notifError) {
        console.error("Notification failed (non-fatal):", notifError.message)
      }

      // Step 5 — Send email (non-fatal if fails)
      try {
        if (influencerUser?.email) {
          await sendEmail({
            to: influencerUser.email,
            ...applicationAcceptedEmail({
              influencerName,
              campaignTitle,
              workspaceUrl: `${process.env.NEXTAUTH_URL}/workspace/${workspaceId}`,
            }),
          })
        }
      } catch (emailError) {
        console.error("Email failed (non-fatal):", emailError.message)
      }

      return Response.json({ success: true, application: updated, workspaceId })
    }

    // Rejected path
    try {
      if (influencer?.userId) {
        await prisma.notification.create({
          data: {
            userId: influencer.userId,
            type: "application_rejected",
            title: "Application Update",
            message: `Your application for "${campaignTitle}" was not selected this time. Keep applying!`,
            link: "/campaigns",
          },
        })
      }
      if (influencerUser?.email) {
        await sendEmail({
          to: influencerUser.email,
          ...applicationRejectedEmail({ influencerName, campaignTitle }),
        })
      }
    } catch (rejError) {
      console.error("Rejection notification failed (non-fatal):", rejError.message)
    }

    return Response.json({ success: true, application: updated })
  } catch (error) {
    console.error("Campaign application PATCH error:", error.message, error.stack)
    return Response.json({ error: "Failed to update", detail: error.message }, { status: 500 })
  }
}
