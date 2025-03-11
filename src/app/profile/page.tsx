import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { User } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user: User | undefined = session?.user;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">โปรไฟล์ของฉัน</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
            <CardDescription>จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.image || "/placeholder-avatar.jpg"} />
                  <AvatarFallback>{user?.name ? user.name[0] : "U"}</AvatarFallback>
                </Avatar>
                <Button variant="outline">เปลี่ยนรูปโปรไฟล์</Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ</Label>
                  <Input id="name" placeholder="ชื่อของคุณ" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <Input id="username" placeholder="ชื่อผู้ใช้ของคุณ" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" type="email" placeholder="อีเมลของคุณ" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">ประวัติโดยย่อ</Label>
                <Textarea id="bio" placeholder="เขียนเกี่ยวกับตัวคุณ..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">เว็บไซต์</Label>
                <Input id="website" type="url" placeholder="https://your-website.com" />
              </div>

              <div className="flex justify-end">
                <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การตั้งค่าการแจ้งเตือน</CardTitle>
            <CardDescription>จัดการการแจ้งเตือนและอีเมลที่คุณได้รับ</CardDescription>
          </CardHeader>
          <CardContent>
            {/* เพิ่มการตั้งค่าการแจ้งเตือนที่นี่ */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
