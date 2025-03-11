import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  // ตัวอย่างข้อมูลคำสั่งซื้อ (ในการใช้งานจริงควรดึงจาก API)
  const orders = [
    {
      id: "ORD001",
      customer: "สมชาย ใจดี",
      product: "AI Image Generator Pro",
      amount: 2999,
      status: "completed",
      paymentMethod: "credit_card",
      date: "2024-03-07"
    },
    {
      id: "ORD002",
      customer: "สมหญิง รักดี",
      product: "Thai NLP Dataset Bundle",
      amount: 1499,
      status: "pending",
      paymentMethod: "bank_transfer",
      date: "2024-03-07"
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
      completed: { label: "สำเร็จ", variant: "success" },
      pending: { label: "รอดำเนินการ", variant: "warning" },
      cancelled: { label: "ยกเลิก", variant: "destructive" }
    }
    return statusMap[status] || { label: status, variant: "default" }
  }

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      credit_card: "บัตรเครดิต",
      bank_transfer: "โอนเงิน"
    }
    return methodMap[method] || method
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">คำสั่งซื้อ</h1>
          <p className="text-gray-500">จัดการคำสั่งซื้อทั้งหมด</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
            <CardDescription>ภาพรวมคำสั่งซื้อทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">คำสั่งซื้อทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">150</div>
                  <p className="text-xs text-muted-foreground">+12% จากเดือนที่แล้ว</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">รายได้</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">฿45,231</div>
                  <p className="text-xs text-muted-foreground">+8% จากเดือนที่แล้ว</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">ต้องดำเนินการ</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">ยกเลิก</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">ในเดือนนี้</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการคำสั่งซื้อล่าสุด</CardTitle>
            <CardDescription>จัดการและติดตามสถานะคำสั่งซื้อ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสคำสั่งซื้อ</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>จำนวนเงิน</TableHead>
                  <TableHead>วิธีชำระเงิน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>฿{order.amount.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentMethodLabel(order.paymentMethod)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(order.status).variant}>
                        {getStatusBadge(order.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/orders/${order.id}`}>
                            ดูรายละเอียด
                          </Link>
                        </Button>
                        {order.status === "pending" && (
                          <Button variant="outline" size="sm">
                            อนุมัติ
                          </Button>
                        )}
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