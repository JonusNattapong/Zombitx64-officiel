import { DefaultSession } from "next-auth"

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

interface UserAccount {
  id: string
  provider: string
  type: string
  providerAccountId: string
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      accounts?: UserAccount[]
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: UserRole
    accounts?: UserAccount[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    accounts?: UserAccount[]
  }
}
