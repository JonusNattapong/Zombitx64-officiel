import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CartPage() {
  // ตัวอย่างข้อมูลในตะกร้า (ในการใช้งานจริงควรดึงจาก state management หรือ API)
  const cartItems = [
    {
      id: 1,
      name: "Thai Text Classification Dataset",
      type: "Dataset",
      price: 2999,
      license: "Commercial",
      size: "2.3 GB",
      records: "150,000 records"
    },
    {
      id: 2,
      name: "Thai Named Entity Recognition Model",
      type: "AI Model",
      price: 4999,
      license: "Academic",
      size: "850 MB",
      records: "Pre-trained model"
    }
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const discount = 500 // ตัวอย่างส่วนลด
  const total = subtotal - discount

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">ตะกร้าสินค้า</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>ประเภท: {item.type}</p>
                      <p>ขนาด: {item.size}</p>
                      <p>จำนวนข้อมูล: {item.records}</p>
                      <p>ใบอนุญาต: {item.license}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">฿{item.price.toLocaleString()}</p>
                    <Button variant="outline" size="sm" className="text-red-600">
                      ลบ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>ราคารวม</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>ส่วนลด</span>
                  <span>-฿{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>ยอดรวมทั้งหมด</span>
                  <span>฿{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon">รหัสส่วนลด</Label>
                <div className="flex space-x-2">
                  <Input id="coupon" placeholder="กรอกรหัสส่วนลด" />
                  <Button variant="outline">ใช้</Button>
                </div>
              </div>

              <Button className="w-full" size="lg">
                ดำเนินการชำระเงิน
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ใบอนุญาตการใช้งาน</CardTitle>
              <CardDescription>
                เลือกประเภทใบอนุญาตที่เหมาะกับการใช้งานของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium">Academic License</p>
                    <p className="text-sm text-gray-500">สำหรับการศึกษาและวิจัย</p>
                  </div>
                  <Button variant="outline" size="sm">เลือก</Button>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium">Commercial License</p>
                    <p className="text-sm text-gray-500">สำหรับการใช้งานเชิงพาณิชย์</p>
                  </div>
                  <Button variant="outline" size="sm">เลือก</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 