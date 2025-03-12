import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink } from "lucide-react";

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return redirect("/api/auth/signin?callbackUrl=/marketplace/purchases");
  }
  
  // ดึงข้อมูลการซื้อของผู้ใช้
  const purchases = await db.purchase.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        include: {
          owner: {
            select: {
              name: true,
              image: true,
            },
          },
          dataset: {
            select: {
              id: true,
              coverImage: true,
            },
          },
        },
      },
    },
  });
  
  // แบ่งกลุ่มการซื้อตามประเภท (ปัจจุบัน, หมดอายุ)
  const now = new Date();
  const activePurchases = purchases.filter(p => !p.expiresAt || p.expiresAt > now);
  const expiredPurchases = purchases.filter(p => p.expiresAt && p.expiresAt <= now);
  
  // คำนวณยอดรวมที่ใช้ซื้อทั้งหมด
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);
  
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">รายการซื้อของฉัน</h1>
          <p className="text-muted-foreground">
            จัดการ dataset และการสมัครสมาชิกที่คุณซื้อแล้ว
          </p>
        </div>
        <Card className="md:w-64">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">ยอดรวมที่ใช้จ่าย</p>
            <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
      </div>
      
      {purchases.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>คุณยังไม่มีรายการซื้อ</CardTitle>
            <CardDescription>
              เริ่มต้นด้วยการสำรวจ dataset ที่มีในตลาดของเรา
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/marketplace">
                สำรวจตลาด Dataset
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-semibold mb-4">Dataset ที่ใช้งานได้ ({activePurchases.length})</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dataset</TableHead>
                    <TableHead>ราคา</TableHead>
                    <TableHead>วันที่ซื้อ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">ดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                            {purchase.product.dataset?.coverImage && (
                              <Image
                                src={purchase.product.dataset.coverImage}
                                alt={purchase.product.title}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{purchase.product.title}</div>
                            <div className="text-xs text-muted-foreground">
                              โดย {purchase.product.owner.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                      <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                      <TableCell>
                        {purchase.expiresAt ? (
                          <>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              ใช้งานได้
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              หมดอายุ {formatDate(purchase.expiresAt)}
                            </div>
                          </>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            ถาวร
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/marketplace/dataset/${purchase.product.datasetId}/download`}>
                              <Download className="w-3.5 h-3.5 mr-1" />
                              ดาวน์โหลด
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/marketplace/product-listing/${purchase.productId}`}>
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              ดู
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
          
          {expiredPurchases.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">การสมัครที่หมดอายุ ({expiredPurchases.length})</h2>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dataset</TableHead>
                      <TableHead>ราคา</TableHead>
                      <TableHead>วันที่ซื้อ</TableHead>
                      <TableHead>วันหมดอายุ</TableHead>
                      <TableHead className="text-right">ดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                              {purchase.product.dataset?.coverImage && (
                                <Image
                                  src={purchase.product.dataset.coverImage}
                                  alt={purchase.product.title}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{purchase.product.title}</div>
                              <div className="text-xs text-muted-foreground">
                                โดย {purchase.product.owner.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                        <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                        <TableCell>{formatDate(purchase.expiresAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" asChild>
                            <Link href={`/marketplace/checkout?productId=${purchase.productId}&renew=true`}>
                              ต่ออายุ
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
