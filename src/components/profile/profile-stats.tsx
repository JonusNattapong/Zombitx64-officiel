import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type ProfileStatsProps = {
  productsCount: number;
  purchasesCount: number;
  memberSince: Date;
  role: string | null;
};

export function ProfileStats({ productsCount, purchasesCount, memberSince, role }: ProfileStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>สถิติโปรไฟล์</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <span className="font-medium">จำนวนสินค้า:</span> {productsCount}
        </div>
        <div>
          <span className="font-medium">จำนวนการซื้อ:</span> {purchasesCount}
        </div>
        <div>
          <span className="font-medium">เป็นสมาชิกตั้งแต่:</span> {formatDate(memberSince)}
        </div>
        <div>
          <span className="font-medium">บทบาท:</span> {role || "User"}
        </div>
      </CardContent>
    </Card>
  );
}