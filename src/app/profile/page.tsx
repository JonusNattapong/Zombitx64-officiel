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

  // เนื่องจากหน้านี้เป็น Server Component เราจะต้องส่งข้อมูลผู้ใช้ไปยัง Client Component
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

type ProfileFormData = {
  name: string;
  image?: FileList;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
};

// Client Component สำหรับจัดการฟอร์ม
function ProfileForm({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const { toast } = useToast();

  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    formState: { errors: profileErrors } 
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name || "",
    }
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: ""
    }
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    if (data.image?.[0]) {
      formData.append("image", data.image[0]);
    }

    const response = await fetch("/api/user/update", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      // Refresh the page to show updated data
      window.location.reload();
    } else {
      const errorData = await response.json();
      toast({
        title: "Error",
        description: errorData.error || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordChanging(true);
    
    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully",
        });
        passwordForm.reset(); // Reset password form fields
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...registerProfile("name", { required: "Name is required" })}
              />
              {profileErrors.name && (
                <p className="text-red-500 text-sm">{profileErrors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="image">Profile Image</Label>
              <Input id="image" type="file" {...registerProfile("image")} />
            </div>
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user.role || "User"}
            </div>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>

        {/* Password Change Form */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register("currentPassword", { required: "Current password is required" })}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-500 text-sm">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register("newPassword", { 
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-sm">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <Button type="submit" variant="outline" disabled={isPasswordChanging}>
              {isPasswordChanging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
