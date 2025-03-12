import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Product {
  imageUrl?: string;
  title: string;
  sellerName: string;
  price: number;
  finalPrice: number;
  subscriptionType?: "monthly" | "yearly" | "quarterly";
}

interface OrderSummaryProps {
  product: Product;
  discountAmount?: number;
}

export function OrderSummary({ product, discountAmount = 0 }: OrderSummaryProps) {
  const finalPrice = product.price - discountAmount;
  return (
    <Card>
      <CardHeader>
        <CardTitle>สรุปรายการสั่งซื้อ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          {product.imageUrl ? (
            <div className="relative w-24 h-24 rounded-md overflow-hidden border">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
              <span className="text-muted-foreground text-xs">ไม่มีรูปภาพ</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-medium text-base mb-1">{product.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">ผู้ขาย: {product.sellerName}</p>
            {product.subscriptionType && (
              <Badge variant="outline">
                {product.subscriptionType === "monthly" && "สมาชิกรายเดือน"}
                {product.subscriptionType === "yearly" && "สมาชิกรายปี"}
                {product.subscriptionType === "quarterly" && "สมาชิกรายไตรมาส"}
              </Badge>
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>ราคา:</span>
            <span>{formatCurrency(product.price)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">ส่วนลด:</span>
              <span className="text-green-600">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>ค่าธรรมเนียมการทำธุรกรรม:</span>
            <span>฿0.00</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium">
            <span>ยอดรวม:</span>
            <span>{formatCurrency(finalPrice)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          <p>
            เมื่อคุณคลิก &quot;ชำระเงิน&quot; คุณยอมรับ{" "}
            <Link href="/terms" className="underline">
              เงื่อนไขการใช้บริการ
            </Link>{" "}
            และ{" "}
            <Link href="/privacy" className="underline">
              นโยบายความเป็นส่วนตัว
            </Link>{" "}
            ของเรา
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
