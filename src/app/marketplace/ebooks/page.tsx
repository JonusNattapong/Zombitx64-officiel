import Link from "next/link";
import Image from "next/image";
import { Book, Filter, Search } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "E-Books | ZombitX64 Marketplace",
  description: "Browse and purchase e-books from our marketplace",
};

interface EbooksPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getEbooks(searchParams) {
  const query = searchParams.q || "";
  const category = searchParams.category || "";
  const sortBy = searchParams.sort || "newest";

  // Create base query
  const where = {
    productType: "ebook",
    status: "PUBLISHED",
    ...(query ? { 
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ] 
    } : {}),
    ...(category ? { category: category } : {}),
  };

  try {
    const ebooks = await db.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        coverImage: true,
        category: true,
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            purchases: true,
          },
        },
      },
      orderBy: sortBy === "price_asc" 
        ? { price: "asc" } 
        : sortBy === "price_desc" 
        ? { price: "desc" } 
        : { createdAt: "desc" },
    });

    return ebooks;
  } catch (error) {
    console.error("Failed to fetch ebooks:", error);
    return [];
  }
}

export default async function EbooksPage({ searchParams }: EbooksPageProps) {
  const ebooks = await getEbooks(searchParams);
  const categories = ["Fiction", "Non-Fiction", "Technical", "Education", "Business", "Self-Help", "Biography"];

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">E-Books</h1>
            <p className="text-muted-foreground">
              Browse and discover digital books from our marketplace
            </p>
          </div>
          <Button asChild>
            <Link href="/marketplace/upload-ebook">
              <Book className="mr-2 h-4 w-4" /> Upload an E-Book
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <form>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        name="q"
                        placeholder="Search e-books..."
                        defaultValue={searchParams.q || ""}
                        className="pl-8"
                      />
                    </div>
                  </form>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Categories</p>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        href={`/marketplace/ebooks?category=${category.toLowerCase()}`}
                        className={`block px-2 py-1 text-sm rounded-md ${
                          searchParams.category === category.toLowerCase()
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Sort By</p>
                  <Select
                    defaultValue={searchParams.sort || "newest"}
                    onValueChange={(value) => {
                      const url = new URL(window.location.href);
                      url.searchParams.set("sort", value);
                      window.location.href = url.toString();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* E-book Grid */}
          <div className="md:col-span-3">
            {ebooks.length === 0 ? (
              <div className="text-center py-12">
                <Book className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">No E-Books Found</h2>
                <p className="mt-2 text-muted-foreground">
                  We couldn't find any e-books matching your criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ebooks.map((ebook) => (
                  <Card key={ebook.id} className="overflow-hidden">
                    <div className="aspect-[3/4] relative bg-muted">
                      {ebook.coverImage ? (
                        <Image
                          src={ebook.coverImage}
                          alt={ebook.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <Book className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="line-clamp-1 text-lg">
                        <Link
                          href={`/marketplace/product-listing/${ebook.id}`}
                          className="hover:underline"
                        >
                          {ebook.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>By {ebook.owner.name}</span>
                        <span className="mx-2">•</span>
                        <span>{ebook._count.purchases} sold</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {ebook.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 border-t flex items-center justify-between">
                      <Badge variant="outline">{ebook.category}</Badge>
                      <span className="font-bold">{formatCurrency(ebook.price)}</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
