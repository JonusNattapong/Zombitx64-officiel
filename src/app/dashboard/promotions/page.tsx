import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PromotionsPage() {
  // ตัวอย่างข้อมูลโปรโมชัน (ในการใช้งานจริงควรดึงจาก API)
  const promotions = [
    {
      id: 1,
      code: "DATASET30",
      name: "ส่วนลด Dataset 30%",
      type: "percentage",
      value: 30,
      minPurchase: 1000,
      usageLimit: 100,
      usageCount: 45,
      validFrom: "2024-03-01",
      validTo: "2024-03-31",
      status: "active",
      conditions: ["เฉพาะ Dataset", "ขั้นต่ำ 1,000 บาท"]
    },
    {
      id: 2,
      code: "AIMODEL500",
      name: "ส่วนลด AI Model 500 บาท",
      type: "fixed",
      value: 500,
      minPurchase: 2000,
      usageLimit: 50,
      usageCount: 12,
      validFrom: "2024-03-15",
      validTo: "2024-04-15",
      status: "scheduled",
      conditions: ["เฉพาะ AI Model", "ขั้นต่ำ 2,000 บาท"]
    }
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">โปรโมชันและส่วนลด</h1>
          <p className="text-gray-500">จัดการโปรโมชันและส่วนลดสำหรับ Dataset และ AI Model</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/promotions/new">สร้างโปรโมชันใหม่</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>สรุปโปรโมชัน</CardTitle>
            <CardDescription>ภาพรวมของโปรโมชันทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">โปรโมชันที่ใช้งานอยู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">กำลังใช้งาน</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">การใช้งานทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">57</div>
                  <p className="text-xs text-muted-foreground">ครั้ง</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">ส่วนลดที่ใช้ไป</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">฿15,750</div>
                  <p className="text-xs text-muted-foreground">มูลค่ารวม</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">อัตราการใช้</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">38%</div>
                  <p className="text-xs text-muted-foreground">ของโควต้าทั้งหมด</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการโปรโมชัน</CardTitle>
            <CardDescription>จัดการโปรโมชันและส่วนลดทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ชื่อโปรโมชัน</TableHead>
                  <TableHead>ส่วนลด</TableHead>
                  <TableHead>เงื่อนไข</TableHead>
                  <TableHead>การใช้งาน</TableHead>
                  <TableHead>ระยะเวลา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.name}</TableCell>
                    <TableCell>
                      {promo.type === "percentage" 
                        ? `${promo.value}%` 
                        : `฿${promo.value.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside">
                        {promo.conditions.map((condition, index) => (
                          <li key={index} className="text-sm text-gray-500">{condition}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>
                      {promo.usageCount}/{promo.usageLimit}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>เริ่ม: {promo.validFrom}</p>
                        <p>สิ้นสุด: {promo.validTo}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.status === "active" ? "success" : "secondary"}>
                        {promo.status === "active" ? "ใช้งานอยู่" : "รอกำหนดการ"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/promotions/${promo.id}/edit`}>แก้ไข</Link>
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          ยกเลิก
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 