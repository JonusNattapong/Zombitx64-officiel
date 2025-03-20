import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  Download,
  Eye,
  FileText,
  Globe,
  Languages,
  Star,
  User,
  Bookmark,
  Share2,
} from "lucide-react";
import { EbookPreview } from "@/components/marketplace/ebook-preview";
import { AddToCartButton } from "@/components/marketplace/add-to-cart-button";

export async function generateMetadata({ params }): Promise<Metadata> {
  const ebook = await db.product.findUnique({
    where: { id: params.id, productType: "ebook" },
    select: {
      name: true,
      description: true,
    },
  });

  if (!ebook) {
    return {
      title: "E-Book Not Found | ZombitX64 Marketplace",
      description: "This E-Book does not exist or has been removed.",
    };
  }

  return {
    title: `${ebook.name} | ZombitX64 Marketplace`,
    description: ebook.description.substring(0, 160),
  };
}

async function getEbook(id: string) {
  const ebook = await db.product.findUnique({
    where: { 
      id,
      productType: "ebook"
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      dataset: {
        select: {
          coverImage: true,
          metadata: true,
        }
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  return ebook;
}

export default async function EbookPage({ params }) {
  const session = await getServerSession(authOptions);
  const ebook = await getEbook(params.id);

  if (!ebook) {
    return notFound();
  }

  // Parse metadata for additional ebook details
  const metadata = ebook.dataset?.metadata ? JSON.parse(ebook.dataset.metadata) : {};
  const isOwner = session?.user?.id === ebook.owner.id;
  const hasPreview = metadata.hasPreview === true;

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Cover and actions */}
        <div className="space-y-6">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden border shadow-sm">
            {ebook.dataset?.coverImage ? (
              <Image
                src={ebook.dataset.coverImage}
                alt={ebook.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="space-y-2 flex flex-col">
            {isOwner ? (
              <Button asChild variant="default">
                <Link href={`/marketplace/ebooks/${params.id}/edit`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Edit E-Book
                </Link>
              </Button>
            ) : (
              <AddToCartButton
                productId={ebook.id}
                productName={ebook.name}
                price={ebook.price}
                productType="ebook"
              />
            )}

            {hasPreview && !isOwner && (
              <Button asChild variant="outline">
                <Link href={`/marketplace/ebooks/${params.id}/reader?preview=true`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview E-Book
                </Link>
              </Button>
            )}

            {(isOwner || session?.user?.role === "ADMIN") && (
              <Button asChild variant="secondary">
                <Link href={`/marketplace/ebooks/${params.id}/reader`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read Full E-Book
                </Link>
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="flex-1">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="flex-1">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right column: Book details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{ebook.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge>{ebook.category}</Badge>
              <p className="text-muted-foreground text-sm flex items-center">
                <Clock className="mr-1 h-3 w-3" /> 
                {formatDate(ebook.createdAt)}
              </p>
              <p className="text-muted-foreground text-sm flex items-center">
                <Download className="mr-1 h-3 w-3" /> 
                {ebook._count.transactions} sales
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-3">
              <Link
                href={`/profile/${ebook.owner.id}`}
                className="flex items-center gap-2 hover:underline"
              >
                {ebook.owner.image ? (
                  <Image
                    src={ebook.owner.image}
                    alt={ebook.owner.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span>{ebook.owner.name}</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">(4.0)</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <p className="text-3xl font-bold">{formatCurrency(ebook.price)}</p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">About this E-Book</h2>
            <p className="text-muted-foreground whitespace-pre-line">{ebook.description}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metadata.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Author:</span>
                <span className="text-sm text-muted-foreground">{metadata.author}</span>
              </div>
            )}
            
            {metadata.language && (
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Language:</span>
                <span className="text-sm text-muted-foreground">
                  {metadata.language.charAt(0).toUpperCase() + metadata.language.slice(1)}
                </span>
              </div>
            )}
            
            {metadata.publishYear && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Published:</span>
                <span className="text-sm text-muted-foreground">{metadata.publishYear}</span>
              </div>
            )}
            
            {metadata.pages && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Pages:</span>
                <span className="text-sm text-muted-foreground">{metadata.pages}</span>
              </div>
            )}
            
            {metadata.publisher && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Publisher:</span>
                <span className="text-sm text-muted-foreground">{metadata.publisher}</span>
              </div>
            )}
          </div>
          
          {metadata.tableOfContents && (
            <div className="space-y-3">
              <Separator />
              <h2 className="text-xl font-semibold">Table of Contents</h2>
              <div className="prose prose-sm max-w-none">
                <EbookPreview content={metadata.tableOfContents} />
              </div>
            </div>
          )}
          
          {metadata.sampleContent && (
            <div className="space-y-3">
              <Separator />
              <h2 className="text-xl font-semibold">Sample Content</h2>
              <div className="prose prose-sm max-w-none bg-muted p-4 rounded-md">
                <EbookPreview content={metadata.sampleContent} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
