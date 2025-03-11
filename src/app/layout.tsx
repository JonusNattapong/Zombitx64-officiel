import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Web3ProviderWrapper } from "@/components/providers/web3-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ZombitX64",
  description: "Your All-in-One AI Platform",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <AuthProvider>
          <Web3ProviderWrapper>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <div className="flex-1">{children}</div>
            </div>
            <Toaster />
          </Web3ProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
