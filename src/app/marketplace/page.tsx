import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";

export const metadata = {
  title: "Marketplace - ZombitX64",
  description: "Discover and share AI models, datasets, and tools",
}

export default function MarketplacePage() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">AI Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The marketplace is under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            Our marketplace will feature a wide range of AI models, datasets, and tools. Stay tuned for updates!
            <Link href="/marketplace/product-listing">Product Listing</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
