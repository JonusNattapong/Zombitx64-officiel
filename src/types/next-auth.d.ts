import { DefaultSession } from "next-auth"

export type UserRole = "user" | "admin" | "moderator"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
    walletAddress?: string | null
  }

  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}
