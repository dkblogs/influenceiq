import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const influencerUsers = await prisma.user.findMany({
    where: { role: "influencer" },
    select: { id: true, name: true, email: true },
  })

  let created = 0
  let alreadyExisted = 0
  const errors = []

  for (const user of influencerUsers) {
    const existing = await prisma.influencer.findFirst({
      where: { userId: user.id },
    })

    if (existing) {
      alreadyExisted++
      continue
    }

    const name = user.name || user.email.split("@")[0]
    const parts = name.trim().split(" ")
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()
    const handle = `@${user.email.split("@")[0].replace(/[^a-z0-9]/gi, "_")}`

    try {
      await prisma.influencer.create({
        data: {
          userId: user.id,
          name,
          email: user.email,
          handle,
          niche: "Other",
          platform: "Instagram",
          followers: "0",
          engagement: "0%",
          score: 0,
          rate: "₹0/post",
          initials,
          location: "",
        },
      })
      created++
    } catch (e) {
      errors.push({ userId: user.id, email: user.email, error: e.message })
    }
  }

  return Response.json({
    total: influencerUsers.length,
    created,
    alreadyExisted,
    errors,
  })
}
