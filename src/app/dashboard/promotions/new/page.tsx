import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function NewPromotionPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/promotions" className="text-sm text-gray-500 hover:text-gray-700 mb-2 block">
            ← กลับไปยังรายการโปรโมชัน
          </Link>
          <h1 className="text-3xl font-bold">สร้างโปรโมชันใหม่</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดโปรโมชัน</CardTitle>
          <CardDescription>กรอกข้อมูลเพื่อสร้างโปรโมชันใหม่</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อโปรโมชัน</Label>
                <Input id="name" placeholder="ชื่อโปรโมชัน" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">รหัสโปรโมชัน</Label>
                <Input id="code" placeholder="รหัสสำหรับใช้ส่วนลด" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">ประเภทส่วนลด</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทส่วนลด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">เปอร์เซ็นต์</SelectItem>
                    <SelectItem value="fixed">จำนวนเงิน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">มูลค่าส่วนลด</Label>
                <Input id="value" type="number" placeholder="มูลค่าส่วนลด" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">วันที่เริ่มต้น</Label>
                <Input id="validFrom" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">วันที่สิ้นสุด</Label>
                <Input id="validTo" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">ยอดซื้อขั้นต่ำ (บาท)</Label>
                <Input id="minPurchase" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit">จำกัดการใช้งาน (ครั้ง)</Label>
                <Input id="usageLimit" type="number" placeholder="ไม่จำกัด" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">ประเภทสินค้าที่ร่วมรายการ</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="dataset">Dataset</SelectItem>
                  <SelectItem value="model">AI Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
              <Textarea 
                id="description" 
                placeholder="รายละเอียดและเงื่อนไขของโปรโมชัน"
                className="h-32"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/promotions">ยกเลิก</Link>
              </Button>
              <Button type="submit">สร้างโปรโมชัน</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 