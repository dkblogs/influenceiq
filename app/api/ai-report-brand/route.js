import Groq from "groq-sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, LIMITS } from "@/lib/withRateLimit"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rl = await checkRateLimit(LIMITS.aiBrand, "ai-report-brand")
    if (rl) return rl

    if (session.user.role !== "brand") {
      return Response.json({ error: "Only brands can use this route" }, { status: 403 })
    }

    const { influencerId } = await request.json()
    if (!influencerId) {
      return Response.json({ error: "Missing influencerId" }, { status: 400 })
    }

    const influencer = await prisma.influencer.findFirst({ where: { id: influencerId } })
    if (!influencer) {
      return Response.json({ error: "Influencer not found" }, { status: 404 })
    }

    const brand = await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } })
    if (!brand || brand.credits < 3) {
      return Response.json({ error: "Insufficient credits", redirectTo: "/pricing" }, { status: 402 })
    }

    await prisma.user.update({ where: { id: session.user.id }, data: { credits: { decrement: 3 } } })
    await prisma.creditTransaction.create({ data: { userId: session.user.id, type: "ai_report", amount: -3 } })

    const bio = influencer.instagramBio || influencer.youtubeBio || "Not provided"

    const prompt = `You are an expert influencer marketing consultant helping a brand evaluate whether to collaborate with an influencer.

Influencer Data:
- Name: ${influencer.name}
- Niche: ${influencer.niche}
- Platform: ${influencer.platform}
- Instagram: ${influencer.instagramHandle || "N/A"} | Verified: ${influencer.instagramVerified} | Followers: ${influencer.instagramFollowers ?? "N/A"}
- YouTube: ${influencer.youtubeHandle || "N/A"} | Verified: ${influencer.youtubeVerified} | Subscribers: ${influencer.youtubeFollowers ?? "N/A"}
- Bio: ${bio}
- Location: ${influencer.location || "Not provided"}
- AI Score: ${influencer.aiScore ?? "Not yet scored"}/100

Analyze this influencer STRICTLY from a brand collaboration perspective. Do NOT give improvement suggestions to the influencer. Focus only on what matters to a brand making a hiring decision.

Respond in this exact JSON format with no other text:
{
  "score": <number 0-100>,
  "verdict": "<one line verdict: exactly one of 'Strong fit for collaboration' or 'Moderate fit' or 'Not recommended'>",
  "summary": "<2-3 sentence executive summary for the brand decision maker>",
  "brandFitAnalysis": "<how well this influencer fits brand collaborations in general>",
  "audienceQuality": "<analysis of their audience — engagement quality, authenticity, demographics inference>",
  "contentReliability": "<assessment of content consistency and professional reliability for brand deals>",
  "reachAndImpact": "<realistic assessment of reach, visibility and campaign impact potential>",
  "riskFactors": "<any red flags, risks or concerns a brand should know before collaborating — write 'None identified' if none>",
  "pros": ["<pro 1 from brand perspective>", "<pro 2>", "<pro 3>"],
  "cons": ["<con 1 from brand perspective>", "<con 2>"],
  "idealCampaignTypes": ["<campaign type 1>", "<campaign type 2>", "<campaign type 3>"],
  "estimatedROI": "<qualitative ROI estimate for a brand campaign with this influencer>"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1200,
    })

    const responseText = completion.choices[0]?.message?.content || ""

    let report
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      report = JSON.parse(jsonMatch[0])
    } catch {
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const updatedBrand = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    })

    return Response.json({ success: true, report, newCredits: updatedBrand.credits })

  } catch (error) {
    console.error("AI brand report error:", error.message)
    return Response.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
