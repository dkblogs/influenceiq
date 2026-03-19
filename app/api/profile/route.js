import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const USER_SELECT = {
  id: true, name: true, email: true, role: true,
  brandVerified: true, createdAt: true,
  companyName: true, industry: true, location: true,
  website: true, phone: true, about: true,
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: USER_SELECT,
    })
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })

    let influencer = null
    if (user.role === "influencer") {
      influencer = await prisma.influencer.findFirst({ where: { userId: session.user.id } })
    }

    return Response.json({ user, influencer })
  } catch (error) {
    console.error("Profile GET error:", error.message)
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { role } = session.user

    const userData = { name: body.name || undefined }

    if (role === "brand") {
      Object.assign(userData, {
        companyName: body.companyName !== undefined ? (body.companyName || null) : undefined,
        industry:    body.industry    !== undefined ? (body.industry    || null) : undefined,
        location:    body.location    !== undefined ? (body.location    || null) : undefined,
        website:     body.website     !== undefined ? (body.website     || null) : undefined,
        phone:       body.phone       !== undefined ? (body.phone       || null) : undefined,
        about:       body.about       !== undefined ? (body.about       || null) : undefined,
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: userData,
      select: USER_SELECT,
    })

    let updatedInfluencer = null
    if (role === "influencer") {
      const { name, niche, platform, bio, location, instagramHandle, youtubeHandle } = body
      const existing = await prisma.influencer.findFirst({ where: { userId: session.user.id } })
      if (existing) {
        updatedInfluencer = await prisma.influencer.update({
          where: { id: existing.id },
          data: {
            name: name || undefined,
            niche: niche || undefined,
            platform: platform || undefined,
            about: bio !== undefined ? bio : undefined,
            location: location !== undefined ? location : undefined,
            instagramHandle: instagramHandle !== undefined
              ? (instagramHandle ? (instagramHandle.startsWith("@") ? instagramHandle : `@${instagramHandle}`) : null)
              : undefined,
            youtubeHandle: youtubeHandle !== undefined
              ? (youtubeHandle ? (youtubeHandle.startsWith("@") ? youtubeHandle : `@${youtubeHandle}`) : null)
              : undefined,
          },
        })
      }
    }

    return Response.json({ user: updatedUser, influencer: updatedInfluencer })
  } catch (error) {
    console.error("Profile PATCH error:", error.message)
    return Response.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
