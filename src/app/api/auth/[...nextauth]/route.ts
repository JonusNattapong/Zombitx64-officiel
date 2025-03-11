import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import bcrypt from "bcrypt"
import { db as prisma } from "@/lib/db"
import { UserRole } from "@/types/next-auth"

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            accounts: true,
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as UserRole,
          accounts: user.accounts,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[NextAuth] SignIn callback:", { user, account, profile });
      try {
        if (account && account.provider !== "credentials") {
          // Check if user exists first, using provider account ID
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });

          if (existingAccount) {
            // Update existing user
            await prisma.user.update({
              where: { id: existingAccount.userId },
              data: {
                name: profile?.name || user.name,
                image: profile?.image || user.image,
              },
            });
            console.log("[NextAuth] Updated existing user:", existingAccount.userId);
          } else {
            // Create new user if doesn't exist
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: profile?.name || user.name,
                image: profile?.image || user.image,
                accounts: {
                  create: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    type: account.type,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                },
              },
            });
            console.log("[NextAuth] Created new user:", newUser.id);
          }
        }
        return true;
      } catch (error:any) {
        console.error("[NextAuth] SignIn error:", error.message);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      console.log("[NextAuth] JWT callback:", { token, user, account });
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        // token.accounts = user.accounts // Removed this line
      }

      // Add new account to token if signing in with a provider
      if (account) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          include: { accounts: true },
        });
        token.accounts = dbUser?.accounts || [];
      }

      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback:", { session, token });
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.accounts = token.accounts;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
