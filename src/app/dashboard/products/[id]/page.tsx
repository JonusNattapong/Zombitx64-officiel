import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // ตัวอย่างข้อมูลสินค้า (ในการใช้งานจริงควรดึงจาก API)
  const product = {
    id: params.id,
    name: "AI Image Generator Pro",
    description: "เครื่องมือสร้างภาพด้วย AI ที่ทรงพลังที่สุด รองรับการสร้างภาพหลากหลายรูปแบบ",
    category: "AI Models",
    price: 2999,
    sales: 150,
    rating: 4.8,
    reviews: 45,
    status: "active",
    lastUpdated: "2024-03-07",
    features: [
      "รองรับการสร้างภาพความละเอียดสูงถึง 4K",
      "มี Style preset มากกว่า 100 แบบ",
      "ฟีเจอร์ Advanced editing",
      "รองรับการ Fine-tuning"
    ],
    requirements: {
      cpu: "Intel Core i5 หรือสูงกว่า",
      ram: "16GB RAM ขึ้นไป",
      gpu: "NVIDIA GeForce RTX 3060 หรือสูงกว่า",
      storage: "10GB พื้นที่ว่าง"
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/products" className="text-sm text-gray-500 hover:text-gray-700 mb-2 block">
            ← กลับไปยังรายการสินค้า
          </Link>
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/products/${product.id}/edit`}>แก้ไข</Link>
          </Button>
          <Button variant="destructive">ลบ</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดสินค้า</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">ข้อมูลทั่วไป</TabsTrigger>
                  <TabsTrigger value="requirements">ความต้องการของระบบ</TabsTrigger>
                  <TabsTrigger value="reviews">รีวิว</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">คุณสมบัติเด่น</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="requirements">
                  <div className="space-y-4">
                    <h3 className="font-semibold mb-2">ความต้องการของระบบ</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">CPU</p>
                        <p className="text-gray-600">{product.requirements.cpu}</p>
                      </div>
                      <div>
                        <p className="font-medium">RAM</p>
                        <p className="text-gray-600">{product.requirements.ram}</p>
                      </div>
                      <div>
                        <p className="font-medium">GPU</p>
                        <p className="text-gray-600">{product.requirements.gpu}</p>
                      </div>
                      <div>
                        <p className="font-medium">พื้นที่จัดเก็บ</p>
                        <p className="text-gray-600">{product.requirements.storage}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{product.rating}</span>
                      <div className="text-yellow-400">★★★★★</div>
                      <span className="text-gray-500">({product.reviews} รีวิว)</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการขาย</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">฿{product.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">ยอดขายทั้งหมด: {product.sales} ครั้ง</p>
              </div>
              <div className="space-y-2">
                <Button className="w-full">ซื้อเลย</Button>
                <Button variant="outline" className="w-full">เพิ่มลงตะกร้า</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>วิธีการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <div className="text-2xl mb-1">💳</div>
                    <div className="text-sm">บัตรเครดิต</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏦</div>
                    <div className="text-sm">โอนเงิน</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 