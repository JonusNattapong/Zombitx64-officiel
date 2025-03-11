import { type Metadata } from "next"

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
    <div className="flex min-h-screen flex-col items-center justify-center">
      {children}
    </div>
  )
}
