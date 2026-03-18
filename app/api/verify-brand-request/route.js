import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

const ADMIN_EMAIL = "hello@influenceiq.in"

export async function POST(request) {
  try {
    const { userId, brandName, email, gst, website, linkedin, description, docsLink } = await request.json()

    if (!gst || !description) {
      return Response.json({ error: "GST number and description are required" }, { status: 400 })
    }

    // Log the request as a credit transaction (amount 0, no credits deducted)
    if (userId) {
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: "verification_request",
          amount: 0,
        },
      })
    }

    // Send notification email to admin
    const html = `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f9fafb;padding:40px 16px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:36px;">
    <h2 style="margin:0 0 4px;font-size:20px;color:#111827;">🔵 New Brand Verification Request</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">A brand has submitted a verification request on InfluenceIQ.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
        <td colspan="2" style="padding:12px 16px;font-size:13px;font-weight:600;color:#374151;">Submission details</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">Brand name</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#111827;">${brandName || "—"}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">Contact email</td>
        <td style="padding:12px 16px;font-size:13px;color:#111827;">${email || "—"}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">GST number</td>
        <td style="padding:12px 16px;font-size:13px;font-family:monospace;color:#111827;">${gst}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">Website</td>
        <td style="padding:12px 16px;font-size:13px;">${website ? `<a href="${website}" style="color:#7c3aed;">${website}</a>` : "—"}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">LinkedIn</td>
        <td style="padding:12px 16px;font-size:13px;">${linkedin ? `<a href="${linkedin}" style="color:#7c3aed;">${linkedin}</a>` : "—"}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">Documents link</td>
        <td style="padding:12px 16px;font-size:13px;">${docsLink ? `<a href="${docsLink}" style="color:#7c3aed;">${docsLink}</a>` : "—"}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;">Description</td>
        <td style="padding:12px 16px;font-size:13px;color:#111827;line-height:1.6;">${description}</td>
      </tr>
    </table>

    ${userId ? `<p style="font-size:12px;color:#9ca3af;margin:0;">User ID: ${userId}</p>` : ""}
    <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">Submitted at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>

    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
      <a href="https://erasekit.vercel.app/admin" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;">
        Review in Admin Panel →
      </a>
    </div>
  </div>
</body>
</html>`

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `🔵 Verification request — ${brandName || email}`,
      html,
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error("Verify brand request error:", error.message)
    return Response.json({ error: "Failed to submit request" }, { status: 500 })
  }
}
