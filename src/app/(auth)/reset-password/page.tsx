import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password - ZombitX64",
  description: "Reset your ZombitX64 account password",
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.token ? (
            <ResetPasswordForm token={searchParams.token} />
          ) : (
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Invalid or expired reset link.
              </p>
              <Link href="/forgot-password" className="hover:text-primary">
                Request a new password reset link
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
