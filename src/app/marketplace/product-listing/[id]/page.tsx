import { notFound } from "next/navigation"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductWithOwner, ReviewWithUser } from "@/types/marketplace"

interface ProductDetailsProps {
  params: {
    id: string
  }
}

async function getProductDetails(id: string): Promise<ProductWithOwner | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          createdAt: true
        }
      }
    }
  })

  return product
}

async function getProductReviews(productId: string): Promise<ReviewWithUser[]> {
  const reviews = await prisma.$queryRaw`
    SELECT r.*, 
           u.id as "userId", 
           u.name as "userName", 
           u.image as "userImage"
    FROM "Review" r
    INNER JOIN "User" u ON r."userId" = u.id
    WHERE r."productId" = ${productId}
    ORDER BY r."createdAt" DESC
  `

  return (reviews as any[]).map(r => ({
    id: r.id,
    productId: r.productId,
    userId: r.userId,
    sellerId: r.sellerId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    verified: r.verified,
    helpful: r.helpful,
    user: {
      id: r.userId,
      name: r.userName,
      image: r.userImage
    }
  }))
}

export default async function ProductDetailsPage({ params }: ProductDetailsProps) {
  const session = await getServerSession(authOptions)
  const [product, reviews] = await Promise.all([
    getProductDetails(params.id),
    getProductReviews(params.id)
  ])

  if (!product) {
    notFound()
  }

  const isOwner = session?.user?.id === product.ownerId

  const averageRating = reviews.length
    ? reviews.reduce((sum: number, review: ReviewWithUser) => sum + review.rating, 0) / reviews.length
    : null

  return (
    <div className="container py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                {product.owner.image && (
                  <Image
                    src={product.owner.image}
                    alt={product.owner.name || ""}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{product.owner.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(product.owner.createdAt)}
                  </p>
                </div>
              </div>
              <CardTitle className="text-3xl">{product.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                  {product.category}
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  v{product.version}
                </span>
                {averageRating && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    ★ {averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </CardContent>
          </Card>

          {/* Additional Info Tabs */}
          <Tabs defaultValue="documentation">
            <TabsList>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="documentation" className="mt-4">
              <Card>
                <CardContent className="prose dark:prose-invert max-w-none pt-6">
                  {product.metrics && (
                    <div className="not-prose mb-6">
                      <h3 className="text-lg font-semibold mb-2">Metrics</h3>
                      <pre className="bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(JSON.parse(product.metrics), null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4 space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {review.user.image && (
                        <Image
                          src={review.user.image}
                          alt={review.user.name || ""}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{review.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
              {reviews.length === 0 && (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    No reviews yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Purchase Card */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-2xl">
                {formatCurrency(product.price)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwner ? (
                <Button className="w-full" variant="outline" disabled>
                  You own this product
                </Button>
              ) : session ? (
                <form action="/api/marketplace/purchase">
                  <input type="hidden" name="productId" value={product.id} />
                  <Button className="w-full" type="submit">
                    Purchase Now
                  </Button>
                </form>
              ) : (
                <Button className="w-full" disabled>
                  Sign in to purchase
                </Button>
              )}
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Instant delivery</p>
                <p>• Technical support</p>
                <p>• Updates included</p>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              By purchasing, you agree to our terms of service.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
