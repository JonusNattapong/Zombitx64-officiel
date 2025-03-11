import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">เพิ่มสินค้าใหม่</h1>
        <Button variant="outline">ย้อนกลับ</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดสินค้า</CardTitle>
          <CardDescription>กรอกข้อมูลเกี่ยวกับสินค้าของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">ชื่อสินค้า</Label>
              <Input id="title" placeholder="ชื่อสินค้าของคุณ" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea id="description" placeholder="อธิบายเกี่ยวกับสินค้าของคุณ..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-models">โมเดล AI</SelectItem>
                    <SelectItem value="datasets">ชุดข้อมูล</SelectItem>
                    <SelectItem value="tools">เครื่องมือ</SelectItem>
                    <SelectItem value="services">บริการ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">ราคา (บาท)</Label>
                <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">ไฟล์สินค้า</Label>
              <Input id="files" type="file" multiple />
              <p className="text-sm text-gray-500">อัพโหลดไฟล์ที่เกี่ยวข้องกับสินค้าของคุณ (สูงสุด 5 ไฟล์)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">แท็ก</Label>
              <Input id="tags" placeholder="เพิ่มแท็กโดยใช้เครื่องหมายจุลภาค (,)" />
              <p className="text-sm text-gray-500">เพิ่มแท็กเพื่อให้ผู้ใช้ค้นหาสินค้าของคุณได้ง่ายขึ้น</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">ความต้องการของระบบ</Label>
              <Textarea id="requirements" placeholder="ระบุความต้องการของระบบสำหรับการใช้งานสินค้าของคุณ..." />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline">บันทึกฉบับร่าง</Button>
              <Button type="submit">เผยแพร่สินค้า</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 