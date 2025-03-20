import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";
import EbookUploadForm from "@/components/marketplace/ebook-upload-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Upload E-Book | ZombitX64 Marketplace",
  description: "Upload and sell your e-books on our marketplace",
};

export default async function UploadEbookPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return redirect("/api/auth/signin?callbackUrl=/marketplace/upload-ebook");
  }
  
  // Check if user is banned
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });
  
  if (user?.role === "BANNED") {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTitle>Account Banned</AlertTitle>
          <AlertDescription>Your account is banned from uploading E-Books.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Upload New E-Book</h1>
      <EbookUploadForm userId={session.user.id} />
    </div>
  );
}
