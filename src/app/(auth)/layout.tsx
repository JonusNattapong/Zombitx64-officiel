import { type Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Authentication - ZombitX64",
    template: "%s - ZombitX64",
  },
  description: "Authentication pages for ZombitX64",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        {children}
      </body>
    </html>
  )
}
