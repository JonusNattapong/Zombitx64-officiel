import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MembershipPage() {
  const plans = [
    {
      id: 1,
      name: "Basic",
      price: 0,
      period: "ตลอดชีพ",
      features: [
        "ดาวน์โหลด Dataset ฟรี",
        "เข้าถึงเนื้อหาพื้นฐาน",
        "การสนับสนุนผ่านชุมชน"
      ],
      limitations: [
        "จำกัดการดาวน์โหลด 3 ครั้ง/เดือน",
        "ไม่รวมโมเดล AI",
        "ไม่มีส่วนลดพิเศษ"
      ]
    },
    {
      id: 2,
      name: "Pro",
      price: 499,
      period: "ต่อเดือน",
      features: [
        "ดาวน์โหลดไม่จำกัด",
        "ส่วนลด 10% สำหรับทุกรายการ",
        "เข้าถึง Dataset พรีเมียม",
        "โมเดล AI พื้นฐาน",
        "การสนับสนุนทางอีเมล"
      ],
      recommended: true
    },
    {
      id: 3,
      name: "VIP",
      price: 999,
      period: "ต่อเดือน",
      features: [
        "สิทธิประโยชน์ Pro ทั้งหมด",
        "ส่วนลด 20% สำหรับทุกรายการ",
        "เข้าถึง Dataset พิเศษ",
        "โมเดล AI ขั้นสูง",
        "การสนับสนุนแบบ Priority",
        "สิทธิ์ทดลองใช้ Dataset ใหม่",
        "เชิญเข้าร่วม Workshop"
      ]
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">แผนสมาชิก</h1>
        <p className="text-gray-500">เลือกแผนที่เหมาะกับคุณ</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.recommended ? 'border-blue-500 border-2' : ''}`}>
            {plan.recommended && (
              <div className="absolute -top-3 -right-3 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                แนะนำ
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold">฿{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">สิทธิประโยชน์</h3>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
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
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations && (
                <div>
                  <h3 className="font-semibold mb-2">ข้อจำกัด</h3>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-500">
                        <svg
                          className="h-4 w-4 text-gray-400 mr-2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button className="w-full" variant={plan.recommended ? "default" : "outline"}>
                {plan.price === 0 ? 'เริ่มต้นใช้งานฟรี' : 'สมัครสมาชิก'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>สิทธิประโยชน์พิเศษสำหรับองค์กร</CardTitle>
            <CardDescription>
              แผนสมาชิกแบบองค์กรที่ปรับแต่งได้ตามความต้องการของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">สิทธิประโยชน์หลัก</h3>
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
                    จำนวนผู้ใช้งานไม่จำกัด
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
                    ส่วนลดพิเศษสำหรับองค์กร
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
                    API สำหรับการเข้าถึงข้อมูล
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">บริการเสริม</h3>
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
                    ทีมสนับสนุนเฉพาะองค์กร
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
                    Workshop สำหรับทีม
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
                    การปรับแต่ง Dataset ตามต้องการ
                  </li>
                </ul>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contact">ติดต่อฝ่ายขาย</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 