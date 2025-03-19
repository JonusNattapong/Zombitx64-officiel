import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { EbookReader } from "@/components/marketplace/ebook-reader";
import { ChevronLeft, Book, Share2 } from "lucide-react";

export default async function EbookReaderPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(`/api/auth/signin?callbackUrl=/marketplace/ebooks/${params.id}/reader`);
  }

  // Fetch e-book data
  const ebook = await db.ebook.findUnique({
    where: { id: params.id },
    include: {
      product: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          purchases: {
            where: {
              userId: session.user.id,
              status: "COMPLETED",
            },
          },
        },
      },
    },
  });

  if (!ebook) {
    return notFound();
  }

  // Check if user has purchased this e-book or is the owner
  const hasAccess = 
    ebook.product.owner.id === session.user.id || 
    ebook.product.purchases.length > 0;
  
  // For preview - allow if preview is available and it's a preview mode
  const isPreview = params.preview === 'true';
  const canAccessPreview = ebook.previewUrl && isPreview;
  
  if (!hasAccess && !canAccessPreview) {
    return redirect(`/marketplace/product-listing/${ebook.product.id}`);
  }
  
  // Determine which file URL to use
  const fileUrl = canAccessPreview ? ebook.previewUrl : ebook.fileUrl;
  const fileType = fileUrl.split('.').pop().toLowerCase();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/marketplace/product-listing/${ebook.product.id}`}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{ebook.product.title}</h1>
            <p className="text-sm text-muted-foreground">
              {isPreview ? "Preview Mode" : "Full Version"} • {fileType.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/marketplace/product-listing/${ebook.product.id}`}>
              <Book className="mr-2 h-4 w-4" />
              Details
            </Link>
          </Button>
          {hasAccess && (
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Reader Content */}
      <div className="flex-1 overflow-hidden">
        <EbookReader fileUrl={fileUrl} fileType={fileType} title={ebook.product.title} />
      </div>
    </div>
  );
}
