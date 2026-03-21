import Groq from "groq-sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
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

    const prompt = `You are an expert influencer marketing analyst. Analyze this influencer and provide a detailed report.

Influencer Data:
- Name: ${influencer.name}
- Niche: ${influencer.niche}
- Platform: ${influencer.platform}
- Instagram: ${influencer.instagramHandle || "N/A"} | Verified: ${influencer.instagramVerified} | Followers: ${influencer.instagramFollowers ?? "N/A"}
- YouTube: ${influencer.youtubeHandle || "N/A"} | Verified: ${influencer.youtubeVerified} | Subscribers: ${influencer.youtubeFollowers ?? "N/A"}
- Bio: ${bio}
- Location: ${influencer.location || "Not provided"}

Respond in this exact JSON format with no other text:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "engagementAnalysis": "<analysis of engagement rate and quality>",
  "nicheStrength": "<analysis of niche authority and content focus>",
  "contentConsistency": "<assessment of posting consistency and content quality>",
  "growthPotential": "<growth trajectory and future potential>",
  "brandCollaborationReadiness": "<readiness for brand deals, professionalism>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "idealBrandCategories": ["<category 1>", "<category 2>", "<category 3>"]
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
