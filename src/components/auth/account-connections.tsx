"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { useSession, signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export function AccountConnections() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const accounts = {
    google: session?.user?.accounts?.find((acc: any) => acc.provider === "google"),
    github: session?.user?.accounts?.find((acc: any) => acc.provider === "github"),
  }

  const handleConnect = async (provider: string) => {
    try {
      await signIn(provider, {
        redirect: false,
        callbackUrl: "/settings",
      })
      toast({
        title: "Account Connected",
        description: `Successfully connected your ${provider} account.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to connect ${provider} account. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">Connected Accounts</div>
      <div className="grid gap-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Icons.google className="h-6 w-6" />
            <div>
              <p className="text-sm font-medium">Google Account</p>
              <p className="text-sm text-muted-foreground">
                {accounts.google ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <Button
            variant={accounts.google ? "outline" : "default"}
            onClick={() => handleConnect("google")}
            disabled={!!accounts.google}
          >
            {accounts.google ? "Connected" : "Connect"}
          </Button>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Icons.github className="h-6 w-6" />
            <div>
              <p className="text-sm font-medium">GitHub Account</p>
              <p className="text-sm text-muted-foreground">
                {accounts.github ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <Button
            variant={accounts.github ? "outline" : "default"}
            onClick={() => handleConnect("github")}
            disabled={!!accounts.github}
          >
            {accounts.github ? "Connected" : "Connect"}
          </Button>
        </div>
      </div>
    </div>
  )
}
