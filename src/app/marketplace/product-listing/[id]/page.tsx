import { notFound } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { ProductDetailsClient } from "@/components/marketplace/product-details-client"; // Placeholder
import { User2 } from "lucide-react";

interface ProductDetailsProps {
  params: {
    id: string;
  };
}

const productSelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    category: true,
    fileHash: true,
    version: true,
    metrics: true,
    extendedMetrics: true,
    tags: true,
    ownerId: true,
    datasetId: true,
    productType: true,
    createdAt: true,
    updatedAt: true,
    owner: {
        select: {
            id: true,
            name: true,
            image: true,
            createdAt: true
        }
    },
    dataset: {
        select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            files: {
                select: {
                    id: true,
                    filename: true,
                    fileType: true,
                    fileUrl: true,
                }
            },
            tags: true,
            metadata: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            product: {
                select: {
                    id: true
                }
            }
        }
    }
} satisfies Prisma.ProductSelect;

type ProductWithIncludes = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

async function getProductWithOwnerDetails(id: string): Promise<ProductWithIncludes | null> {
  const productData = await db.product.findUnique({
    where: { id },
    select: productSelect
  });

  if (!productData) {
    return null;
  }

  return productData;
}

const reviewSelect = {
    id: true,
    reviewerId: true,
    revieweeId: true,
    rating: true,
    comment: true,
    createdAt: true,
    updatedAt: true,
    verified: true,
    helpful: true,
    reviewer: {
        select: {
            id: true,
            name: true,
            image: true
        }
    }
} as const;

type ReviewFromDB = Prisma.ReviewGetPayload<{
    select: typeof reviewSelect;
}>;

interface ReviewWithBuyer extends ReviewFromDB {
    buyer: ReviewFromDB['reviewer'];
}

async function getProductReviews(productId: string): Promise<ReviewWithBuyer[]> {
    try {
        const reviews = await db.review.findMany({
            where: { revieweeId: productId },
            select: reviewSelect,
            orderBy: {
                id: "desc"
            }
        }) as ReviewFromDB[];

        return reviews.map(review => ({
            ...review,
            buyer: review.reviewer
        }));
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

export default async function ProductDetailsPage({ params }: ProductDetailsProps) {
  const product = await getProductWithOwnerDetails(params.id);
  const reviews = await getProductReviews(params.id);
  const session = await getServerSession(authOptions);

  if (!product) {
    notFound();
  }

  // Parse metrics if they exist
  const metricsData = product.metrics ? JSON.parse(product.metrics) : null;
  const extendedMetricsData = product.extendedMetrics ? JSON.parse(product.extendedMetrics) : null;

  // Calculate average rating
  const averageRating = reviews.length
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm">
        <a href="/marketplace" className="text-muted-foreground hover:text-primary">
          Marketplace
        </a>
        {" > "}
        <a href={`/marketplace?category=${product.category}`} className="text-muted-foreground hover:text-primary">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </a>
        {" > "}
        <span className="text-foreground">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">{product.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {product.owner.image ? (
                      <Image
                        src={product.owner.image}
                        alt={product.owner.name || ""}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                    )}
                    <span>By {product.owner.name || "Anonymous"}</span>
                    <span>•</span>
                    <span>Updated {formatDate(product.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-lg ${star <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({reviews.length})</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  {product.category}
                </span>
                <span className="px-2 py-1 bg-muted text-xs rounded">
                  v{product.version}
                </span>
                {product.tags && product.tags.split(',').map((tag) => (
                  <span key={tag.trim()} className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs rounded">
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>

              {metricsData && (
                <div className="bg-muted/50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Product Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(metricsData).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-muted-foreground capitalize">{key}</p>
                        <p className="font-medium">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dataset section if available */}
          {product.dataset && (
            <Card>
              <CardHeader>
                <CardTitle>Included Dataset: {product.dataset.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{product.dataset.description}</p>
                {product.dataset.coverImage && (
                  <div className="aspect-video relative overflow-hidden rounded-md">
                    <Image
                      src={product.dataset.coverImage}
                      alt={product.dataset.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-2">Files ({product.dataset.files.length})</h4>
                  <ul className="space-y-1">
                    {product.dataset.files.map(file => (
                      <li key={file.id} className="flex items-center gap-2 text-sm">
                        <span className="p-1 bg-muted rounded">
                          {file.fileType === 'image' ? '🖼️' :
                           file.fileType === 'video' ? '🎬' :
                           file.fileType === 'audio' ? '🎧' : '📄'}
                        </span>
                        {file.filename}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews section */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {review.buyer.image ? (
                          <Image
                            src={review.buyer.image || '/images/default-avatar.png'}
                            alt={review.buyer.name || 'Anonymous User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User2 className="text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{review.buyer.name || 'Anonymous User'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(new Date(review.createdAt))}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p>{review.comment}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {review.helpful} people found this helpful
                      </span>
                      {review.verified && (
                        <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Purchase Sidebar */}
        <div>
          <Card className="sticky top-8">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold mb-4">
                {formatCurrency(product.price)}
              </div>
              
              {/* Fix: Pass only serializable props */}
              {/* <ProductDetailsClient
                productId={product.id}
                ownerId={product.ownerId}
                isOwner={session?.user?.id === product.ownerId}
                isLoggedIn={!!session?.user}
                productData={{
                  title: product.title,
                  description: product.description,
                  price: product.price,
                  category: product.category,
                  version: product.version,
                  datasetId: product.datasetId,
                  metrics: product.metrics,
                  extendedMetrics: product.extendedMetrics,
                  owner: {
                    name: product.owner.name,
                    image: product.owner.image,
                    createdAt: product.owner.createdAt
                  }
                }}
                reviewsData={reviews.map(review => ({
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  createdAt: review.createdAt,
                  user: {
                    name: review.user.name,
                    image: review.user.image
                  }
                }))}
                averageRating={averageRating}
              /> */}
              
              <div className="mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw">
                    <path d="M21 2v6h-6"/>
                    <path d="M21 13a9 9 0 1 1-3-7.7L21 8"/>
                  </svg>
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                  <span>Instant download after purchase</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
