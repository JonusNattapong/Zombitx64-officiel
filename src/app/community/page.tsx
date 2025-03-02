import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Community - ZombitX64",
  description: "Connect with AI developers and researchers",
}

export default function CommunityPage() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Community Hub</h1>

      {/* Featured Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Discussion Forums</CardTitle>
            <CardDescription>
              Engage in AI discussions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Share ideas and get help from the community.</p>
            <Button asChild variant="outline">
              <Link href="#">Coming Soon</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Collaboration</CardTitle>
            <CardDescription>
              Work together on AI projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Find partners and collaborate on exciting projects.</p>
            <Button asChild variant="outline">
              <Link href="#">Coming Soon</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              Join community events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Participate in webinars, workshops, and meetups.</p>
            <Button asChild variant="outline">
              <Link href="#">Coming Soon</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Community Stats */}
      <section className="bg-muted p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Community Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4">
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Members</p>
          </div>
          <div className="p-4">
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Projects</p>
          </div>
          <div className="p-4">
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Discussions</p>
          </div>
          <div className="p-4">
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Events</p>
          </div>
        </div>
      </section>
    </div>
  )
}
