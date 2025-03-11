import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DatasetsPage() {
  // ตัวอย่างข้อมูล Dataset (ในการใช้งานจริงควรดึงจาก API)
  const datasets = [
    {
      id: 1,
      name: "Thai Text Classification Dataset",
      type: "Text",
      size: "2.3 GB",
      records: "150,000",
      status: "Published",
      lastUpdated: "2024-03-07"
    },
    {
      id: 2,
      name: "Thai Image Recognition Dataset",
      type: "Image",
      size: "5.1 GB",
      records: "50,000",
      status: "Draft",
      lastUpdated: "2024-03-06"
    }
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">ชุดข้อมูล</h1>
          <p className="text-gray-500">จัดการชุดข้อมูลทั้งหมดของคุณ</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/datasets/new">เพิ่มชุดข้อมูลใหม่</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ชุดข้อมูลทั้งหมด</CardTitle>
          <CardDescription>รายการชุดข้อมูลที่คุณได้สร้างและจัดการ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ขนาด</TableHead>
                <TableHead>จำนวนรายการ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>อัปเดตล่าสุด</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((dataset) => (
                <TableRow key={dataset.id}>
                  <TableCell className="font-medium">{dataset.name}</TableCell>
                  <TableCell>{dataset.type}</TableCell>
                  <TableCell>{dataset.size}</TableCell>
                  <TableCell>{dataset.records}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      dataset.status === "Published" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {dataset.status}
                    </span>
                  </TableCell>
                  <TableCell>{dataset.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">แก้ไข</Button>
                      <Button variant="outline" size="sm">ดาวน์โหลด</Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">ลบ</Button>
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