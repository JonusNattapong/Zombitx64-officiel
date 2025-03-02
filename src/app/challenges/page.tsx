import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Challenges - ZombitX64",
  description: "Participate in AI challenges and competitions",
}

export default function ChallengesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">AI Challenges</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              AI challenges are being prepared
            </CardDescription>
          </CardHeader>
          <CardContent>
            Get ready for exciting AI challenges, hackathons, and competitions. Compete with others and showcase your skills!
          </CardContent>
        </Card>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Why Participate?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Learn and Grow</CardTitle>
              <CardDescription>
                Enhance your AI development skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              Work on real-world problems and learn from the community.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Win Rewards</CardTitle>
              <CardDescription>
                Earn recognition and prizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              Top performers will receive rewards and recognition from the community.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
