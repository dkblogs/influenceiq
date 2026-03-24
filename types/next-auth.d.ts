import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      brandVerified: boolean
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    role: string
    brandVerified: boolean
    password?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    sub: string
    role: string
    brandVerified: boolean
  }
}
