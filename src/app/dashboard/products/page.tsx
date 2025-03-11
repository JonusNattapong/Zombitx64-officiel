import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function ProductsPage() {
  // ตัวอย่างข้อมูลสินค้า (ในการใช้งานจริงควรดึงจาก API)
  const products = [
    {
      id: 1,
      name: "AI Image Generator Pro",
      category: "AI Models",
      price: 2999,
      sales: 150,
      status: "active",
      lastUpdated: "2024-03-07"
    },
    {
      id: 2,
      name: "Thai NLP Dataset Bundle",
      category: "Datasets",
      price: 1499,
      sales: 89,
      status: "draft",
      lastUpdated: "2024-03-06"
    }
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">สินค้า</h1>
          <p className="text-gray-500">จัดการสินค้าทั้งหมดของคุณ</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">เพิ่มสินค้าใหม่</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สินค้าทั้งหมด</CardTitle>
          <CardDescription>รายการสินค้าที่คุณได้เผยแพร่และฉบับร่าง</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>ราคา</TableHead>
                <TableHead>ยอดขาย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>อัปเดตล่าสุด</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/products/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>฿{product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.sales}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === "active" ? "success" : "secondary"}>
                      {product.status === "active" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/products/${product.id}/edit`}>แก้ไข</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/products/${product.id}`}>ดูรายละเอียด</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        ลบ
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
  )
} 