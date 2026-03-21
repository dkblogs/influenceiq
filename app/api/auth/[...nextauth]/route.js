import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
const bcrypt = require("bcryptjs")

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[auth] Missing credentials")
            return null
          }

          const normalizedEmail = credentials.email.toLowerCase().trim()
          console.log("[auth] Login attempt:", normalizedEmail)

          let user
          try {
            user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
          } catch (dbErr) {
            console.error("[auth] Prisma query error:", dbErr)
            throw new Error("Database error, please try again")
          }

          console.log("[auth] User found:", !!user)
          if (!user) throw new Error("No account found with this email")

          if (!user.password) {
            console.log("[auth] No password field — OAuth account")
            throw new Error("This account uses a different sign-in method")
          }

          let passwordMatch = false
          try {
            passwordMatch = await bcrypt.compare(credentials.password, user.password)
          } catch (bcryptErr) {
            console.error("[auth] bcrypt error:", bcryptErr)
            throw new Error("Authentication error, please try again")
          }

          console.log("[auth] Password match:", passwordMatch)
          if (!passwordMatch) throw new Error("Incorrect password")

          console.log("[auth] Login success:", normalizedEmail)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            credits: user.credits,
          }
        } catch (err) {
          console.error("[auth] authorize error:", err.message)
          throw err
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.sub = user.id
        token.role = user.role
        token.credits = user.credits
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = session.user ?? {}
        session.user.id = token.id ?? token.sub ?? ""
        session.user.role = token.role ?? "brand"
        session.user.brandVerified = token.brandVerified ?? false
      }
      return session
    },
  },
  pages: { signIn: "/login" },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
