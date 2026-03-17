import Groq from "groq-sdk"
import { prisma } from "@/lib/prisma"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const body = await request.json()
    const { product, targetAudience, budget, platform, niche, goal } = body

    if (!product || !targetAudience || !niche) {
      return Response.json({ error: "Product, target audience, and niche are required" }, { status: 400 })
    }

    // Fetch all influencers, filter by platform if specified
    const where = {}
    if (platform && platform !== "Any") where.platform = platform
    if (niche && niche !== "Any") where.niche = niche

    let influencers = await prisma.influencer.findMany({
      where,
      select: {
        id: true,
        name: true,
        handle: true,
        niche: true,
        platform: true,
        followers: true,
        engagement: true,
        rate: true,
        location: true,
        score: true,
        verified: true,
        about: true,
      },
      orderBy: { score: "desc" },
      take: 50, // cap to avoid huge prompts
    })

    // Fallback: if niche filter gives < 5 results, broaden to all
    if (influencers.length < 5) {
      influencers = await prisma.influencer.findMany({
        select: {
          id: true,
          name: true,
          handle: true,
          niche: true,
          platform: true,
          followers: true,
          engagement: true,
          rate: true,
          location: true,
          score: true,
          verified: true,
          about: true,
        },
        orderBy: { score: "desc" },
        take: 50,
      })
    }

    if (influencers.length === 0) {
      return Response.json({ error: "No influencers found in the database" }, { status: 404 })
    }

    const influencerList = influencers
      .map((inf, i) =>
        `${i + 1}. ID:${inf.id} | ${inf.name} (${inf.handle}) | Niche:${inf.niche} | Platform:${inf.platform} | Followers:${inf.followers} | Engagement:${inf.engagement} | Rate:${inf.rate} | Score:${inf.score} | Verified:${inf.verified} | Location:${inf.location}`
      )
      .join("\n")

    const prompt = `You are an expert influencer marketing strategist helping a brand find the best influencer matches.

BRAND CAMPAIGN BRIEF:
- Product/Brand: ${product}
- Target Audience: ${targetAudience}
- Campaign Goal: ${goal || "General awareness"}
- Budget: ${budget || "Flexible"}
- Preferred Platform: ${platform || "Any"}
- Niche: ${niche}

AVAILABLE INFLUENCERS:
${influencerList}

Analyse the campaign brief and select the top 3 to 5 best-matching influencers from the list above. Consider niche alignment, engagement rate, follower count relative to budget, platform fit, and audience match.

Respond in this exact JSON format with no other text:
{
  "recommendations": [
    {
      "id": "<influencer id>",
      "name": "<name>",
      "handle": "<handle>",
      "niche": "<niche>",
      "platform": "<platform>",
      "followers": "<followers>",
      "engagement": "<engagement>",
      "score": <score number>,
      "matchScore": <0-100 how well they match this campaign>,
      "matchReason": "<2-3 sentences explaining exactly why this influencer is a great fit for this specific campaign>",
      "suggestedApproach": "<1 sentence on how the brand should approach this collaboration>"
    }
  ],
  "summary": "<2-3 sentence overall strategy note for this campaign>"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 1500,
    })

    const responseText = completion.choices[0]?.message?.content || ""

    let result
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      result = JSON.parse(jsonMatch[0])
    } catch {
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    return Response.json({ success: true, ...result })

  } catch (error) {
    console.error("Recommend error:", error.message)
    return Response.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
