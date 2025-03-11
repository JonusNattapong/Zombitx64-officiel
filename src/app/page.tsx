import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to ZombitX64
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Your All-in-One AI Platform. Discover, learn, and build with the latest AI technology.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/marketplace">Explore Marketplace</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/aboutmarket">About Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Marketplace</CardTitle>
                <CardDescription>
                  Discover and share AI models, datasets, and tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                Browse through a curated collection of AI resources, from pre-trained models to custom datasets.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
