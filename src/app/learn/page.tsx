import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Learning Hub - ZombitX64",
  description: "Learn AI development through comprehensive resources and tutorials",
}

export default function LearnPage() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Learning Hub</h1>
      
      {/* Learning Paths Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Beginner's Path</CardTitle>
              <CardDescription>
                Start your AI journey here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Learn the fundamentals of AI and machine learning.</p>
              <Button asChild variant="outline">
                <Link href="#">Coming Soon</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Intermediate Path</CardTitle>
              <CardDescription>
                Advance your AI knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Deep dive into neural networks and deep learning.</p>
              <Button asChild variant="outline">
                <Link href="#">Coming Soon</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Expert Path</CardTitle>
              <CardDescription>
                Master advanced AI concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Explore cutting-edge AI research and applications.</p>
              <Button asChild variant="outline">
                <Link href="#">Coming Soon</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Tutorials</CardTitle>
              <CardDescription>
                Learn by doing
              </CardDescription>
            </CardHeader>
            <CardContent>
              Hands-on tutorials with live code execution and instant feedback.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Comprehensive guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              Detailed documentation, best practices, and API references.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
