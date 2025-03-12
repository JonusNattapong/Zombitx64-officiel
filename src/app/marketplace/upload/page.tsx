import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DatasetUploadForm } from "@/components/marketplace/dataset-upload-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from "@/lib/db";

export default async function UploadDatasetPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertTitle>การเข้าถึงถูกปฏิเสธ</AlertTitle>
          <AlertDescription>กรุณาเข้าสู่ระบบเพื่ออัพโหลด dataset</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // อาจมีการตรวจสอบสิทธิ์เพิ่มเติม เช่น ต้องเป็นสมาชิกที่ยืนยันแล้ว
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });
  
  if (user?.role === "BANNED") {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTitle>บัญชีถูกระงับ</AlertTitle>
          <AlertDescription>บัญชีของคุณถูกระงับไม่ให้อัพโหลด Dataset</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">อัพโหลด Dataset ใหม่</h1>
      <DatasetUploadForm userId={session.user.id} />
    </div>
  );
}
