import { Suspense } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ProductWithOwner } from "@/types/marketplace";
import { SearchFilters } from "@/components/marketplace/search-filters";

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    fileHash: string;
    version: string;
    metrics: unknown; // Changed from 'any' to 'unknown'
    owner: {
        id: string;
        name: string | null;
        image: string | null;
    };
    productType: string;
    datasetId: string | null;
}

const categories = [
    "Datasets",
    "Models",
    "APIs",
    "Tools",
    "Services",
];

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
    );
}

function ProductCard({ product }: { product: Product }) {
    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    {product.owner.image ? (
                        <Image
                            src={product.owner.image}
                            alt={product.owner.name || "Owner"}
                            width={24}
                            height={24}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                    )}
                    <span className="text-sm text-muted-foreground">
                        {product.owner.name || "Unknown Owner"}
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
                    {/* Display datasetId if available */}
                    {product.datasetId && (
                        <span className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs rounded">
                            Dataset ID: {product.datasetId}
                        </span>
                    )}
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
    );
}

async function MarketplaceContent({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const search =
        typeof searchParams.search === "string" ? searchParams.search : "";
    const category =
        typeof searchParams.category === "string" ? searchParams.category : "";
    const sort = typeof searchParams.sort === "string" ? searchParams.sort : "latest";
    const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;

    const url = new URL(
        "/api/marketplace",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    );
    url.searchParams.set("search", search);
    // Only set category if it's not "all"
    if (category && category !== "all") {
        url.searchParams.set("category", category);
    }
    url.searchParams.set("sort", sort);
    url.searchParams.set("page", page.toString());
    // Removed productType filter

    try {
        const response = await fetch(url, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch products");
        }

        if (!data.products || !Array.isArray(data.products)) {
            throw new Error("Invalid response format");
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
        );
    } catch (error) {
        return (
            <div className="col-span-full text-center py-10 text-red-500">
                {error instanceof Error
                    ? error.message
                    : "An error occurred while fetching products"}
            </div>
        );
    }
}

export default function MarketplacePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    return (
        <div className="container py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Marketplace</h1>
                <Link href="/marketplace/add-product">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <SearchFilters
                initialSearch={searchParams.search?.toString()}
                initialCategory={searchParams.category?.toString()}
                categories={categories}
            />

            {/* Products Grid */}
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /></div>}>
                <MarketplaceContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
