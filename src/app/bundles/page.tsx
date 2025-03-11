import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BundlesPage() {
  // ตัวอย่างข้อมูล Bundle (ในการใช้งานจริงควรดึงจาก API)
  const bundles = [
    {
      id: 1,
      name: "Thai NLP Complete Bundle",
      description: "ชุดข้อมูลสำหรับ NLP ภาษาไทยที่ครบถ้วนที่สุด",
      price: 9999,
      originalPrice: 15000,
      items: [
        "Thai Text Classification Dataset",
        "Thai Named Entity Recognition Dataset",
        "Thai Sentiment Analysis Dataset",
        "Thai Word Segmentation Model"
      ],
      features: [
        "รวม 4 Dataset คุณภาพสูง",
        "ข้อมูลรวมกว่า 500,000 รายการ",
        "เหมาะสำหรับโปรเจค NLP ขนาดใหญ่",
        "ฟรี! โมเดลพื้นฐานสำหรับเริ่มต้น"
      ],
      tag: "Best Value"
    },
    {
      id: 2,
      name: "Computer Vision Starter Pack",
      description: "ชุด Dataset สำหรับเริ่มต้นทำ Computer Vision",
      price: 7999,
      originalPrice: 12000,
      items: [
        "Thai Scene Classification Dataset",
        "Thai Object Detection Dataset",
        "Thai OCR Dataset"
      ],
      features: [
        "รวม 3 Dataset พร้อมใช้งาน",
        "รูปภาพคุณภาพสูงกว่า 100,000 ภาพ",
        "Annotation ครบถ้วน",
        "คู่มือการใช้งานภาษาไทย"
      ],
      tag: "Popular"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">แพ็คเกจ Dataset</h1>
        <p className="text-gray-500">ประหยัดมากขึ้นด้วยแพ็คเกจที่คัดสรรมาเพื่อคุณ</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {bundles.map((bundle) => (
          <Card key={bundle.id} className="relative">
            {bundle.tag && (
              <div className="absolute -top-3 -right-3 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                {bundle.tag}
              </div>
            )}
            <CardHeader>
              <CardTitle>{bundle.name}</CardTitle>
              <CardDescription>{bundle.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">฿{bundle.price.toLocaleString()}</span>
                  <span className="text-gray-500 line-through">฿{bundle.originalPrice.toLocaleString()}</span>
                  <span className="text-green-600 text-sm">
                    ประหยัด {Math.round((1 - bundle.price/bundle.originalPrice) * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Dataset ที่รวมอยู่ในแพ็คเกจ</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {bundle.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">คุณสมบัติเด่น</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {bundle.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button className="w-full" size="lg">
                  ซื้อแพ็คเกจนี้
                </Button>
                <Button variant="outline" className="w-full">
                  ดูรายละเอียดเพิ่มเติม
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-6">แพ็คเกจสำหรับองค์กร</h2>
        <Card>
          <CardHeader>
            <CardTitle>Enterprise Bundle</CardTitle>
            <CardDescription>
              แพ็คเกจสำหรับองค์กรที่ต้องการ Dataset คุณภาพสูงพร้อมการสนับสนุนเต็มรูปแบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>เลือก Dataset ได้ไม่จำกัด</li>
              <li>สิทธิ์การใช้งานแบบ Enterprise</li>
              <li>ทีมสนับสนุนเฉพาะองค์กร</li>
              <li>การปรับแต่ง Dataset ตามความต้องการ</li>
              <li>API สำหรับการเข้าถึงข้อมูล</li>
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