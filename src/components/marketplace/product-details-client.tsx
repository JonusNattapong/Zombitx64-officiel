"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";

// Define props as serializable data only (no functions)
interface ProductDetailsClientProps {
  productId: string;
  ownerId: string;
  isOwner: boolean;
  isLoggedIn: boolean;
  productData: {
    title: string;
    description: string;
    price: number;
    category: string;
    version: string;
    datasetId: string | null;
    metrics: string | null;
    extendedMetrics: string | null;
    owner: {
      name: string | null;
      image: string | null;
      createdAt: Date;
    };
  };
  reviewsData: {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    user: {
      name: string | null;
      image: string | null;
    };
  }[];
  averageRating: number;
}

export function ProductDetailsClient({
  productId,
  ownerId,
  isOwner,
  isLoggedIn,
  productData,
  reviewsData,
  averageRating
}: ProductDetailsClientProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handlePurchase() {
    if (!isLoggedIn) {
      router.push(`/api/auth/signin?callbackUrl=/marketplace/product-listing/${productId}`);
      return;
    }

    try {
      setIsPurchasing(true);
      const response = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to purchase product");
      }

      toast({
        title: "Purchase successful!",
        description: "You now own this product. Check your library for access.",
      });

      // Redirect to library or receipt page
      router.push("/dashboard/library");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsPurchasing(false);
    }
  }

  // All client-side rendering happens here
  return (
    <div className="space-y-4">
      {isOwner ? (
        <Alert>
          <AlertTitle>You own this product</AlertTitle>
          <AlertDescription>
            You can manage this product from your dashboard.
          </AlertDescription>
        </Alert>
      ) : (
        <Button
          onClick={handlePurchase}
          className="w-full"
          disabled={isPurchasing}
        >
          {isPurchasing ? "Processing..." : "Buy Now"}
        </Button>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full">
          Add to Cart
        </Button>
        <Button variant="outline" className="w-full">
          Add to Wishlist
        </Button>
      </div>
    </div>
  );
}