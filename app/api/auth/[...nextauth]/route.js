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
        if (!credentials?.email || !credentials?.password) return null

        const normalizedEmail = credentials.email.toLowerCase().trim()

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (!user) throw new Error("No account found with this email")
        if (!user.password) throw new Error("This account uses a different sign-in method")

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) throw new Error("Incorrect password")

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          credits: user.credits,
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
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