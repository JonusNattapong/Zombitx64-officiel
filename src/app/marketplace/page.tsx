import { Suspense } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  fileHash: string
  version: string
  metrics: any
  owner: {
    id: string
    name: string | null
    image: string | null
  }
}

const categories = [
  "AI Models",
  "Datasets",
  "Tools",
  "APIs",
  "Plugins",
  "Documentation"
]

function ProductSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/4" />
      </CardFooter>
    </Card>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          {product.owner.image && (
            <Image
              src={product.owner.image}
              alt={product.owner.name || ""}
              width={24}
              height={24}
              className="rounded-full"
            />
          )}
          <span className="text-sm text-muted-foreground">
            {product.owner.name}
          </span>
        </div>
        <CardTitle className="line-clamp-1 mt-2">
          <Link href={`/marketplace/product-listing/${product.id}`} className="hover:underline">
            {product.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {product.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
            {product.category}
          </span>
          <span className="px-2 py-1 bg-muted text-xs rounded">
            v{product.version}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-lg font-bold">
          {formatCurrency(product.price)}
        </span>
        <Link
          href={`/marketplace/product-listing/${product.id}`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  )
}

async function MarketplaceContent({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const category = typeof searchParams.category === "string" ? searchParams.category : ""
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "latest"
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1

  const url = new URL("/api/marketplace", process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
  url.searchParams.set("search", search)
  // Only set category if it's not "all"
  if (category && category !== "all") {
    url.searchParams.set("category", category)
  }
  url.searchParams.set("sort", sort)
  url.searchParams.set("page", page.toString())
  
  try {
    const response = await fetch(url, { cache: "no-store" })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products')
    }

    if (!data.products || !Array.isArray(data.products)) {
      throw new Error('Invalid response format')
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.products.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No products found
          </div>
        ) : (
          data.products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    )
  } catch (error) {
    return (
      <div className="col-span-full text-center py-10 text-red-500">
        {error instanceof Error ? error.message : 'An error occurred while fetching products'}
      </div>
    )
  }
}

export default function MarketplacePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Marketplace</h1>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search products..."
          className="max-w-sm"
          defaultValue={searchParams.search || ""}
        />
        <Select defaultValue={searchParams.category?.toString()}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue={searchParams.sort?.toString() || "latest"}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }
      >
        <MarketplaceContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
