import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login", error: "/login" },

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
            throw new Error("Email and password required")
          }
          const email = credentials.email.toLowerCase().trim()
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) throw new Error("No account found with this email address")
          if (!user.password) throw new Error("Please sign in with a different method")
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) throw new Error("Incorrect password. Please try again.")
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            brandVerified: user.brandVerified ?? false,
          }
        } catch (error) {
          throw error
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.sub = user.id
        token.role = user.role
        token.brandVerified = user.brandVerified ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id ?? token.sub ?? ""
        session.user.role = token.role ?? "brand"
        session.user.brandVerified = token.brandVerified ?? false
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
