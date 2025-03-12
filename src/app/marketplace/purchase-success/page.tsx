import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function PurchaseSuccessPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return redirect("/api/auth/signin");
  }
  
  const { id: purchaseId } = searchParams;
  
  if (!purchaseId) {
    return redirect("/marketplace");
  }
  
  // ดึงข้อมูลการซื้อ
  const purchase = await db.purchase.findUnique({
    where: {
      id: purchaseId,
      userId: session.user.id,
    },
    include: {
      product: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          dataset: true,
        },
      },
    },
  });
  
  if (!purchase) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTitle>ไม่พบรายการสั่งซื้อ</AlertTitle>
          <AlertDescription>
            ไม่พบข้อมูลการสั่งซื้อหรือคุณไม่มีสิทธิ์เข้าถึงรายการนี้
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">การซื้อสำเร็จ!</h1>
        <p className="text-muted-foreground">
          ขอบคุณสำหรับการซื้อ คุณสามารถเข้าถึง dataset ได้ทันที
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">รายละเอียดการซื้อ</h2>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            {purchase.product.dataset?.coverImage ? (
              <div className="relative w-20 h-20 rounded-md overflow-hidden">
                <Image
                  src={purchase.product.dataset.coverImage}
                  alt={purchase.product.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground text-xs">ไม่มีรูปภาพ</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{purchase.product.title}</h3>
              <p className="text-sm text-muted-foreground">
                ผู้ขาย: {purchase.product.owner.name}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">รหัสคำสั่งซื้อ:</span>
            <span>{purchase.id.substring(0, 8).toUpperCase()}</span>
            
            <span className="text-muted-foreground">วันที่ซื้อ:</span>
            <span>{formatDate(purchase.createdAt)}</span>
            
            <span className="text-muted-foreground">ราคา:</span>
            <span>{formatCurrency(purchase.amount)}</span>
            
            <span className="text-muted-foreground">วิธีการชำระเงิน:</span>
            <span className="capitalize">{purchase.paymentMethod.replace('_', ' ')}</span>
            
            {purchase.product.productType === 'subscription' && (
              <>
                <span className="text-muted-foreground">ประเภทการสมัคร:</span>
                <span className="capitalize">{purchase.subscriptionType}</span>
                
                <span className="text-muted-foreground">วันหมดอายุ:</span>
                <span>{formatDate(purchase.expiresAt || new Date())}</span>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t p-6 flex gap-4 flex-wrap">
          <Button asChild className="flex-1">
            <Link href={`/marketplace/dataset/${purchase.product.datasetId}/download`}>
              ดาวน์โหลด Dataset
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/marketplace/purchases">
              ดูรายการซื้อทั้งหมด
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <Alert className="mb-8">
        <AlertTitle>มีคำถาม?</AlertTitle>
        <AlertDescription>
          หากคุณมีปัญหาในการดาวน์โหลดหรือใช้งาน dataset โปรดติดต่อ <a href="/support" className="underline">ฝ่ายสนับสนุน</a> ของเรา
          หรือติดต่อผู้ขายโดยตรงที่ <a href={`/profile/${purchase.product.owner.id}`} className="underline">{purchase.product.owner.name}</a>
        </AlertDescription>
      </Alert>
      
      <div className="text-center">
        <Button asChild variant="link">
          <Link href="/marketplace">
            กลับไปยังตลาด Dataset
          </Link>
        </Button>
      </div>
    </div>
  );
}
