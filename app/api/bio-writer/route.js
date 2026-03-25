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

    const rl = await checkRateLimit(LIMITS.bioWriter, "bio-writer")
    if (rl) return rl

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } })
    if (!user || user.credits < 1) {
      return Response.json({ error: "Insufficient credits", redirectTo: "/pricing" }, { status: 402 })
    }

    const body = await request.json()
    const { name, niche, platform, achievements, style, location } = body

    if (!name || !niche || !platform) {
      return Response.json({ error: "Name, niche, and platform are required" }, { status: 400 })
    }

    await prisma.user.update({ where: { id: session.user.id }, data: { credits: { decrement: 1 } } })
    await prisma.creditTransaction.create({ data: { userId: session.user.id, type: "bio_writer", amount: -1 } })

    const prompt = `You are a professional copywriter who specialises in writing compelling influencer bios for brand partnerships.

Write a polished, professional bio for this influencer based on their answers:

- Name: ${name}
- Content Niche: ${niche}
- Primary Platform: ${platform}
- Location: ${location || "India"}
- Key Achievements / Stats: ${achievements || "Growing creator with engaged audience"}
- Content Style / Tone: ${style || "Authentic and engaging"}

Write 3 versions of their bio:
1. SHORT (1 sentence, max 120 chars) — for Instagram/Twitter bio field
2. MEDIUM (2-3 sentences, ~200 chars) — for platform profiles and media kits
3. LONG (4-6 sentences, ~400 chars) — for full media kits and collaboration pitches

Guidelines:
- Write in first person ("I create..." not "She creates...")
- Sound human, warm, and credible — not corporate or generic
- Highlight what makes them unique and valuable to brands
- Include the niche, platform, and a hook that brands will remember
- Do NOT use clichés like "passionate about", "lover of", "journey"

Respond in this exact JSON format with no other text:
{
  "short": "<one-line bio>",
  "medium": "<2-3 sentence bio>",
  "long": "<4-6 sentence bio>",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
  "tip": "<one actionable tip to improve their profile for brand deals>"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
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
    console.error("Bio writer error:", error.message)
    return Response.json({ error: "Failed to generate bio" }, { status: 500 })
  }
}
