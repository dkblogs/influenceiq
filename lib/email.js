import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const BRAND = "#7C3AED"
const FROM = "InfluenceIQ <onboarding@resend.dev>"

function baseTemplate(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>InfluenceIQ</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="https://erasekit.vercel.app" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
                <span style="font-size:24px;">⚡</span>
                <span style="font-size:22px;font-weight:700;color:#111827;">Influence<span style="color:${BRAND};">IQ</span></span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;padding:40px 36px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2025 InfluenceIQ · India's AI Influencer Marketplace
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">
                <a href="https://erasekit.vercel.app" style="color:#9ca3af;">erasekit.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function welcomeEmail({ name, role }) {
  const isInfluencer = role === "influencer"
  const nextStep = isInfluencer
    ? { label: "List your profile", url: "https://erasekit.vercel.app/join", text: "Get discovered by brands — set up your creator profile and start receiving collaboration requests." }
    : { label: "Find influencers", url: "https://erasekit.vercel.app/discover", text: "Search thousands of AI-scored creators by niche, platform, and location — completely free." }

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Welcome to InfluenceIQ, ${name}! 👋</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Your account is ready. We've added <strong style="color:${BRAND};">5 free credits</strong> to get you started — no card needed.
    </p>

    <!-- Credits badge -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#f5f3ff;border-radius:12px;padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:13px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your balance</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:${BRAND};">5 credits</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Credits never expire · Buy more anytime</p>
        </td>
      </tr>
    </table>

    <!-- What you can do -->
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#374151;">What you can do with your credits</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;">
      ${isInfluencer ? `
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#4b5563;">Apply to brand campaigns</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:${BRAND};text-align:right;white-space:nowrap;">2 credits</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#4b5563;">Send a collaboration request</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:${BRAND};text-align:right;white-space:nowrap;">10 credits</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#4b5563;">Browse brands &amp; open campaigns</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#16a34a;text-align:right;white-space:nowrap;">Free</td>
      </tr>
      ` : `
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#4b5563;">Unlock influencer contact details</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:${BRAND};text-align:right;white-space:nowrap;">5 credits</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:12px 16px;font-size:13px;color:#4b5563;">Full AI scoring report</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:${BRAND};text-align:right;white-space:nowrap;">3 credits</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#4b5563;">Browse &amp; search influencers</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#16a34a;text-align:right;white-space:nowrap;">Free</td>
      </tr>
      `}
    </table>

    <!-- Next step -->
    <p style="margin:0 0 12px;font-size:14px;color:#6b7280;">${nextStep.text}</p>
    <a href="${nextStep.url}"
       style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
      ${nextStep.label} →
    </a>
  `

  return {
    from: FROM,
    to: undefined, // caller sets this
    subject: `Welcome to InfluenceIQ — your 5 free credits are ready`,
    html: baseTemplate(body),
  }
}

export function paymentConfirmationEmail({ name, plan, credits, newTotal, paymentId }) {
  const planEmoji = { Starter: "🚀", Growth: "📈", Agency: "🏢" }[plan] ?? "💳"

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Payment confirmed ${planEmoji}</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
      Hi ${name}, your <strong>${plan}</strong> plan purchase was successful. Your credits have been added instantly.
    </p>

    <!-- Order summary -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr style="background:#f9fafb;">
        <td colspan="2" style="padding:14px 20px;font-size:13px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Order summary</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;">Plan</td>
        <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#111827;text-align:right;">${plan}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;">Credits added</td>
        <td style="padding:14px 20px;font-size:14px;font-weight:600;color:${BRAND};text-align:right;">+${credits} credits</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;">New balance</td>
        <td style="padding:14px 20px;font-size:14px;font-weight:700;color:#111827;text-align:right;">${newTotal} credits</td>
      </tr>
      <tr>
        <td style="padding:14px 20px;font-size:13px;color:#9ca3af;">Payment ID</td>
        <td style="padding:14px 20px;font-size:12px;color:#9ca3af;text-align:right;font-family:monospace;">${paymentId}</td>
      </tr>
    </table>

    <!-- New balance highlight -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#f5f3ff;border-radius:12px;padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:13px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Total balance</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:${BRAND};">${newTotal} credits</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Credits never expire</p>
        </td>
      </tr>
    </table>

    <a href="https://erasekit.vercel.app/dashboard"
       style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
      Go to dashboard →
    </a>
  `

  return {
    from: FROM,
    to: undefined, // caller sets this
    subject: `${planEmoji} ${plan} plan activated — ${credits} credits added to your account`,
    html: baseTemplate(body),
  }
}

export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email to", to)
    return { success: false, error: "No API key" }
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) {
      console.error("Resend error:", error)
      return { success: false, error }
    }
    return { success: true, id: data.id }
  } catch (err) {
    console.error("sendEmail threw:", err.message)
    return { success: false, error: err.message }
  }
}
