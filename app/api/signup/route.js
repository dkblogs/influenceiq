import { prisma } from "../../../lib/prisma"
import { sendEmail, welcomeEmail } from "../../../lib/email"
const bcrypt = require("bcryptjs")


export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

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