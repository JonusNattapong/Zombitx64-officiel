import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Use Card components
import { Prisma } from "@prisma/client";

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
  productType: true,
  ownerId: true,
  owner: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
  datasetId: true,
  dataset: {
    select: {
      id: true,
      coverImage: true,
    },
  },
} as const;

type ProductWithIncludes = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

type CheckoutFormProps = {
  productId: string;
  productType: string;
  finalPrice: number;
  subscriptionType?: string;
};

type OrderSummaryProps = {
  product: ProductWithIncludes & {
    finalPrice: number;
    discountAmount: number;
    imageUrl: string | null;
    sellerName: string | null;
    subscriptionType: "monthly" | "yearly" | "quarterly" | null;
  };
  discountAmount: number;
};

import { Suspense } from "react";
import dynamic from "next/dynamic";

const DynamicCheckoutForm = dynamic<CheckoutFormProps>(() =>
  Promise.resolve(({ productId, productType, finalPrice, subscriptionType }: CheckoutFormProps) => (
    <div>Loading checkout form...</div>
  ))
, { ssr: false });

const DynamicOrderSummary = dynamic<OrderSummaryProps>(() =>
  Promise.resolve(({ product, discountAmount }: OrderSummaryProps) => (
    <div>Loading order summary...</div>
  ))
, { ssr: false });

// Replace components in usage
const CheckoutForm = DynamicCheckoutForm;
const OrderSummary = DynamicOrderSummary;


interface CheckoutPageProps {
  searchParams: {
    productId: string;
    subscriptionType?: string;
  };
}

interface CheckoutData {
  product: ProductWithIncludes & {
    finalPrice: number;
    discountAmount: number;
    imageUrl: string | null;
    sellerName: string | null;
    subscriptionType: "monthly" | "yearly" | "quarterly" | null;
  };
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/api/auth/signin?callbackUrl=/marketplace");
  }

  const { productId, subscriptionType } = searchParams;

  if (!productId) {
    return redirect("/marketplace");
  }

  const product: ProductWithIncludes | null = await db.product.findUnique({
    where: { id: productId },
    select: productSelect,
  });

if (!product) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
            <CardDescription>
              The product you are trying to purchase does not exist or may have
              been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check if the user is not the product owner
  if (product.ownerId === session.user.id) {
    return redirect(`/marketplace/product-listing/${productId}`);
  }
  // Check if the user has already purchased this product
  const existingTransaction = await db.transaction.findFirst({
    where: {
      buyerId: session.user.id,
      productId: product.id,
      // Don't check for subscriptions as they might need renewal
      ...(product.productType !== "subscription" && { status: "completed" }),
    },
  });

  if (existingTransaction && product.productType !== "subscription") {
    return redirect(
      `/marketplace/product-listing/${productId}?purchased=true`
    );
  }

  // Calculate the final price, considering discounts or promotions
  const finalPrice = product.price;
  const discountAmount = 0;

  // TODO: Enable promotion checks after running prisma generate
  // Promotion checks are temporarily disabled until schema is updated

  const checkoutData: CheckoutData = {
    product: {
      ...product,
      finalPrice,
      discountAmount,
      imageUrl: product.dataset?.coverImage ?? null,
      sellerName: product.owner.name ?? "Unknown Seller",
      subscriptionType:
        (subscriptionType as "monthly" | "yearly" | "quarterly") ||
        (product.productType === "subscription" ? "monthly" : null),
    },
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div key="checkout-form">
            <CheckoutForm
              productId={product.id}
              productType={product.productType}
              finalPrice={finalPrice}
              subscriptionType={subscriptionType ?? undefined}
            />
          </div>
        </div>
        <div>
          <div key="order-summary">
            <OrderSummary product={checkoutData.product} discountAmount={discountAmount} />
          </div>
        </div>
      </div>
    </div>
  );
}
