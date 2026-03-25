import { prisma } from "../../../lib/prisma"
import { sendEmail, welcomeEmail } from "../../../lib/email"
import { checkRateLimit, LIMITS } from "@/lib/withRateLimit"
const bcrypt = require("bcryptjs")


export async function POST(request) {
  try {
    const rl = await checkRateLimit(LIMITS.auth, "signup")
    if (rl) return rl

    const body = await request.json()
    const { name, password, role, instagramHandle, youtubeHandle } = body
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : ""

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "brand",
        credits: 5,
      },
    })

    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: "welcome",
        amount: 5,
      },
    })

    if (role === "influencer") {
      const parts = name.trim().split(" ")
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase()
      const handle = `@${email.split("@")[0].replace(/[^a-z0-9]/gi, "_")}`
      try {
        await prisma.influencer.create({
          data: {
            userId: user.id,
            name,
            email,
            handle,
            niche: "Other",
            platform: "Instagram",
            followers: "0",
            engagement: "0%",
            score: 0,
            rate: "₹0/post",
            initials,
            location: "",
            instagramHandle: instagramHandle ? (instagramHandle.startsWith("@") ? instagramHandle : `@${instagramHandle}`) : null,
            youtubeHandle: youtubeHandle ? (youtubeHandle.startsWith("@") ? youtubeHandle : `@${youtubeHandle}`) : null,
          },
        })
      } catch (e) {
        // Non-fatal: influencer can set up profile via /join
        console.warn("Auto-create influencer row failed:", e.message)
      }
    }

    const template = welcomeEmail({ name, role: user.role })
    sendEmail({ to: email, subject: template.subject, html: template.html })

    return Response.json({
      success: true,
      message: "Account created successfully",
      userId: user.id,
    })

  } catch (error) {
    console.error("Signup error:", error.message, error.stack)
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}