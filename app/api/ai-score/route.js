import Groq from "groq-sdk"
import { prisma } from "@/lib/prisma"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { influencerId } = body

    if (!influencerId) {
      return Response.json({ error: "Missing influencerId" }, { status: 400 })
    }

    const influencer = await prisma.influencer.findFirst({
      where: { id: influencerId },
    })

    if (!influencer) {
      return Response.json({ error: "Influencer not found" }, { status: 404 })
    }

    const prompt = `You are an influencer marketing analyst. Based on the following influencer data, provide a detailed scoring analysis.

Influencer Profile:
- Name: ${influencer.name}
- Platform: ${influencer.platform}
- Niche: ${influencer.niche}
- Followers: ${influencer.followers}
- Engagement Rate: ${influencer.engagement}
- Location: ${influencer.location}
- Average Rate: ${influencer.rate}
- Verified: ${influencer.verified}

Please provide scores out of 100 for each of these 6 factors and a brief explanation for each:

1. Engagement Rate Score - based on ${influencer.engagement} engagement rate
2. Audience Quality Score - based on platform and niche
3. Content Consistency Score - based on posting patterns for ${influencer.platform}
4. Niche Authority Score - based on ${influencer.niche} niche expertise
5. Growth Trend Score - estimated growth potential
6. Brand Safety Score - suitability for brand partnerships

Respond in this exact JSON format with no other text:
{
  "engagement": <number>,
  "audienceQuality": <number>,
  "contentConsistency": <number>,
  "nicheAuthority": <number>,
  "growthTrend": <number>,
  "brandSafety": <number>,
  "engagementNote": "<brief explanation>",
  "audienceQualityNote": "<brief explanation>",
  "contentConsistencyNote": "<brief explanation>",
  "nicheAuthorityNote": "<brief explanation>",
  "growthTrendNote": "<brief explanation>",
  "brandSafetyNote": "<brief explanation>",
  "overallScore": <weighted average>,
  "summary": "<2 sentence overall assessment>"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1000,
    })

    const responseText = completion.choices[0]?.message?.content || ""

    let scoreData
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      scoreData = JSON.parse(jsonMatch[0])
    } catch (e) {
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    await prisma.influencer.update({
      where: { id: influencerId },
      data: { score: scoreData.overallScore },
    })

    return Response.json({
      success: true,
      scores: scoreData,
    })

  } catch (error) {
    console.error("AI score error:", error.message)
    return Response.json({ error: "Failed to generate score" }, { status: 500 })
  }
}