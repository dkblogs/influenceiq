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

    console.log("1. Fetching application details for id:", id)
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
    console.log("1. OK — campaign:", application.campaign.title, "userId:", application.userId)

    // Get influencer record and user email
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
    console.log("1b. influencer:", influencer?.id, influencer?.name, "| email:", influencerUser?.email)

    const influencerName = influencer?.name || "Influencer"
    const campaignTitle = application.campaign.title

    console.log("2. Updating application status:", id, "→", status)
    const updated = await prisma.campaignApplication.update({
      where: { id },
      data: { status },
    })
    console.log("2. OK")

    if (status === "accepted") {
      console.log("3. Creating proposal — brandId:", application.campaign.brandId, "influencerId:", influencer?.id)
      const proposal = await prisma.proposal.create({
        data: {
          brandId: application.campaign.brandId,
          influencerId: influencer.id,
          status: "agreed",
          campaignTitle: application.campaign.title,
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
      console.log("3. OK — proposalId:", proposal.id)

      console.log("4. Creating workspace with milestones...")
      const workspace = await prisma.campaignWorkspace.create({
        data: {
          proposalId: proposal.id,
          brandId: application.campaign.brandId,
          influencerId: influencer.id,
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
      console.log("4. OK — workspaceId:", workspace.id)

      console.log("5. Unlocking contact for brandId:", application.campaign.brandId, "influencerId:", influencer.id)
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
      console.log("5. OK")

      console.log("6. Creating notification for userId:", influencer.userId)
      await prisma.notification.create({
        data: {
          userId: influencer.userId,
          type: "application_accepted",
          title: "🎉 Your application was accepted!",
          message: `${campaignTitle} — Your application has been accepted. Your workspace is ready!`,
          link: `/workspace/${workspace.id}`,
        },
      })
      console.log("6. OK")

      console.log("7. Sending acceptance email to:", influencerUser?.email)
      if (influencerUser?.email) {
        sendEmail({
          to: influencerUser.email,
          ...applicationAcceptedEmail({
            influencerName,
            campaignTitle,
            workspaceUrl: `${process.env.NEXTAUTH_URL}/workspace/${workspace.id}`,
          }),
        }).catch(err => console.error("7. Email send failed:", err.message))
      } else {
        console.log("7. Skipped — no email address")
      }

      console.log("8. Done! workspaceId:", workspace.id)
      return Response.json({ application: updated, workspaceId: workspace.id })
    } else {
      console.log("3. Rejected path — creating notification for userId:", influencer?.userId)
      if (influencer) {
        await prisma.notification.create({
          data: {
            userId: influencer.userId,
            type: "application_rejected",
            title: "Application Update",
            message: `Your application for "${campaignTitle}" was not selected this time. Keep applying!`,
            link: "/campaigns",
          },
        })
        console.log("3. OK — rejection notification created")
      }

      if (influencerUser?.email) {
        sendEmail({
          to: influencerUser.email,
          ...applicationRejectedEmail({ influencerName, campaignTitle }),
        }).catch(err => console.error("Rejection email failed:", err.message))
      }

      return Response.json({ application: updated })
    }
  } catch (error) {
    console.error("Campaign accept error:", error.message, error.stack)
    return Response.json({ error: "Failed to update", detail: error.message }, { status: 500 })
  }
}
