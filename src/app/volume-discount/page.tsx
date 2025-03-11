import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VolumeDiscountPage() {
  const volumeDiscounts = [
    {
      id: 1,
      type: "Dataset",
      tiers: [
        { min: 1, max: 4, discount: 0 },
        { min: 5, max: 9, discount: 10 },
        { min: 10, max: 19, discount: 15 },
        { min: 20, max: null, discount: 20 }
      ]
    },
    {
      id: 2,
      type: "AI Model",
      tiers: [
        { min: 1, max: 2, discount: 0 },
        { min: 3, max: 4, discount: 15 },
        { min: 5, max: 9, discount: 20 },
        { min: 10, max: null, discount: 25 }
      ]
    }
  ]

  const examples = [
    {
      title: "ตัวอย่างการคำนวณส่วนลด Dataset",
      items: [
        {
          description: "ซื้อ Dataset 7 รายการ",
          original: 21000,
          discount: 2100,
          final: 18900
        },
        {
          description: "ซื้อ Dataset 15 รายการ",
          original: 45000,
          discount: 6750,
          final: 38250
        }
      ]
    },
    {
      title: "ตัวอย่างการคำนวณส่วนลด AI Model",
      items: [
        {
          description: "ซื้อ AI Model 3 รายการ",
          original: 15000,
          discount: 2250,
          final: 12750
        },
        {
          description: "ซื้อ AI Model 6 รายการ",
          original: 30000,
          discount: 6000,
          final: 24000
        }
      ]
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ส่วนลดตามปริมาณการซื้อ</h1>
        <p className="text-gray-500">ยิ่งซื้อมาก ยิ่งประหยัดมาก</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {volumeDiscounts.map((vd) => (
          <Card key={vd.id}>
            <CardHeader>
              <CardTitle>ส่วนลดสำหรับ {vd.type}</CardTitle>
              <CardDescription>อัตราส่วนลดตามจำนวนที่สั่งซื้อ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">จำนวน</th>
                      <th className="pb-2">ส่วนลด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vd.tiers.map((tier, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3">
                          {tier.max 
                            ? `${tier.min} - ${tier.max} รายการ`
                            : `${tier.min} รายการขึ้นไป`
                          }
                        </td>
                        <td className="py-3">
                          {tier.discount > 0 
                            ? `${tier.discount}%`
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center">ตัวอย่างการคำนวณส่วนลด</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {examples.map((example, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{example.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {example.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="space-y-2">
                      <h3 className="font-semibold">{item.description}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>ราคาเต็ม:</span>
                          <span>฿{item.original.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>ส่วนลด:</span>
                          <span>-฿{item.discount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>ราคาสุทธิ:</span>
                          <span>฿{item.final.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>ส่วนลดพิเศษสำหรับองค์กร</CardTitle>
            <CardDescription>
              รับส่วนลดเพิ่มเติมสำหรับการสั่งซื้อจำนวนมาก
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                ส่วนลดพิเศษสำหรับการสั่งซื้อจำนวนมาก
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                แผนการชำระเงินที่ยืดหยุ่น
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                บริการให้คำปรึกษาฟรี
              </li>
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contact">ติดต่อฝ่ายขาย</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 