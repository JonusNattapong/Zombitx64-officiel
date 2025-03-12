import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { File, Download, FileText, FileSpreadsheet, FileJson, FileArchive, Info, Code, ExternalLink } from "lucide-react";
import { Prisma } from "@prisma/client";

// Helper function to get appropriate icon for file type
function getFileIcon(fileType: string) {
    switch (fileType?.toLowerCase()) {
        case 'csv':
            return <FileSpreadsheet className="h-5 w-5" />;
        case 'json':
            return <FileJson className="h-5 w-5" />;
        case 'txt':
            return <FileText className="h-5 w-5" />;
        case 'zip':
        case 'rar':
            return <FileArchive className="h-5 w-5" />;
        default:
            return <File className="h-5 w-5" />;
    }
}

export default async function DatasetDownloadPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return redirect(`/api/auth/signin?callbackUrl=/marketplace/dataset/${params.id}/download`);
    }

    const datasetSelect = {
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
                fileSize: true,
            }
        },
        tags: true,
        metadata: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        product: {
            select: {
                id: true,
                licenseType: true,
            }
        },
        user: {
            select: {
                id: true,
                name: true,
                image: true,
            },
        }
    } satisfies Prisma.DatasetSelect;

    type DatasetWithIncludes = Prisma.DatasetGetPayload<{ select: typeof datasetSelect }>;

    // Fetch dataset and access rights
    const dataset: DatasetWithIncludes | null = await db.dataset.findUnique({
        where: { id: params.id },
        select: datasetSelect,
    });

    if (!dataset) {
        notFound();
    }

    // Check if the user has permission to download this dataset
    const hasAccess =
        dataset.userId === session.user.id || // Owner of the dataset
        (await db.transaction.findFirst({
            where: {
                buyerId: session.user.id,
                productId: dataset.product?.id,
                status: "completed", // Ensure the transaction is completed
            },
        }));

    if (!hasAccess) {
        return (
            <div className="container py-10">
                <Alert variant="destructive">
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to access this dataset. Please purchase the dataset before downloading.
                    </AlertDescription>
                </Alert>

                <div className="mt-6 text-center">
                    <Button asChild>
                        <Link href={`/marketplace/product-listing/${dataset.product?.id}`}>
                            View Details and Purchase Dataset
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
      <div className="container py-10">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{dataset.title}</h1>
            <p className="text-muted-foreground">
              By {dataset.user.name} • Last Updated {formatDate(dataset.updatedAt)}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/marketplace/product-listing/${dataset.product?.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Dataset Details
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <File className="mr-2 h-5 w-5" />
                  Dataset Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataset.files.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No files in this dataset
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dataset.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.fileType)}
                          <div>
                            <p className="font-medium">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.fileType?.toUpperCase()} • {formatBytes(file.fileSize || 0)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  Example Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">
                    {`# Python example for loading this dataset
import pandas as pd

# Replace with actual file path after download
file_path = "${dataset.files[0]?.filename || 'example.csv'}"

# Load the dataset
data = pd.read_csv(file_path)

# Basic exploration
print(data.head())
print(data.info())
print(data.describe())`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Date Created</dt>
                    <dd>{formatDate(dataset.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Last Updated</dt>
                    <dd>{formatDate(dataset.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">License Type</dt>
                    <dd>{dataset.product?.licenseType || "Not Specified"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Number of Files</dt>
                    <dd>{dataset.files.length} Files</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Tags</dt>
                    <dd className="flex flex-wrap gap-1 mt-1">
                      {dataset.tags?.map((tag, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-muted rounded-md">
                          {tag}
                        </span>
                      )) || "No tags"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            
            <Alert>
              <AlertTitle>Need Help?</AlertTitle>
              <AlertDescription>
                If you encounter any issues downloading or using the dataset,
                please <Link href="/support" className="underline">contact support</Link>.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }
