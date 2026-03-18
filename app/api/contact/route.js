import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

const ADMIN_EMAIL = "hello@influenceiq.in"

export async function POST(request) {
  try {
    const { userId, name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return Response.json({ error: "All fields are required" }, { status: 400 })
    }

    const saved = await prisma.contactMessage.create({
      data: { userId: userId || null, name, email, subject, message },
    })

    const html = `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f9fafb;padding:40px 16px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:36px;">
    <h2 style="margin:0 0 4px;font-size:20px;color:#111827;">📬 New contact message</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">A user has sent a message through the InfluenceIQ contact form.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
        <td colspan="2" style="padding:12px 16px;font-size:13px;font-weight:600;color:#374151;">Message details</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">Name</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#111827;">${name}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">Email</td>
        <td style="padding:12px 16px;font-size:13px;color:#111827;"><a href="mailto:${email}" style="color:#7c3aed;">${email}</a></td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">Subject</td>
        <td style="padding:12px 16px;font-size:13px;color:#111827;">${subject}</td>
      </tr>
      ${userId ? `<tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;">User ID</td>
        <td style="padding:12px 16px;font-size:12px;font-family:monospace;color:#6b7280;">${userId}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;">Message</td>
        <td style="padding:12px 16px;font-size:13px;color:#111827;line-height:1.7;">${message.replace(/\n/g, "<br/>")}</td>
      </tr>
    </table>

    <p style="font-size:12px;color:#9ca3af;margin:0;">Received: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST · Message ID: ${saved.id}</p>

    <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;">
      <a href="https://erasekit.vercel.app/admin" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;">
        View in Admin Panel →
      </a>
    </div>
  </div>
</body>
</html>`

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `📬 [Contact] ${subject} — ${name}`,
      html,
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error("Contact route error:", error.message)
    return Response.json({ error: "Failed to send message" }, { status: 500 })
  }
}
