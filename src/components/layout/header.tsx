import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-2xl">
            ZombitX64
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/marketplace" className="hover:text-primary">
              Marketplace
            </Link>
            <Link href="/challenges" className="hover:text-primary">
              Challenges
            </Link>
            <Link href="/learn" className="hover:text-primary">
              Learn
            </Link>
            <Link href="/community" className="hover:text-primary">
              Community
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
