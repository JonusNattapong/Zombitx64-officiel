import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileStats } from "@/components/profile/profile-stats";
import { formatDate } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
    nameChanges: { createdAt: Date }[];
  products: any[]; // Replace 'any' with a more specific type if possible
  purchases: any[]; // Replace 'any' with a more specific type if possible
  createdAt: Date;
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="container py-10">
        กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      nameChanges: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      products: true,
      purchases: true,
    },
  }) as any;

  if (!user) {
    return <div className="container py-10">ไม่พบผู้ใช้</div>;
  }

    const lastNameChange = user.nameChanges[0];
    const canChangeName =
      !lastNameChange ||
      new Date(lastNameChange.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000 <
        Date.now();
    const nextNameChangeDate = lastNameChange
      ? new Date(
          new Date(lastNameChange.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000
        )
      : null;

  return (
    <div className="container py-10">
      <Toaster />
      <div className="grid gap-10 md:grid-cols-7">
        <div className="md:col-span-4">
          <h1 className="text-3xl font-bold mb-6">โปรไฟล์ของฉัน</h1>
          <ProfileForm
            user={user}
            canChangeName={canChangeName}
            nextNameChangeDate={nextNameChangeDate}
          />
        </div>
        <div className="md:col-span-3">
          <ProfileStats
            productsCount={user.products.length}
            purchasesCount={user.purchases.length}
            memberSince={user.createdAt}
            role={user.role}
          />
        </div>
      </div>
    </div>
  );
}
