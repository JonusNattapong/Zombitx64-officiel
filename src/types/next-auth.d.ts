import { JWT } from "next-auth/jwt"
import type { DefaultSession, DefaultUser } from "next-auth"
import { UserRole } from "@/lib/auth-utils"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role?: UserRole
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role?: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    email?: string | null
    name?: string | null
    picture?: string | null
    role?: UserRole
  }
}
