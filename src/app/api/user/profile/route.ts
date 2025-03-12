import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;

    // ถ้าดูข้อมูลของผู้อื่น จะได้ข้อมูลน้อยกว่า
    const isOwnProfile = userId === session.user.id;

    const profile = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: isOwnProfile, // แสดงอีเมลเฉพาะเจ้าของโปรไฟล์
        image: true,
        bio: true,
        website: true,
        github: true,
        twitter: true,
        role: true,
        createdAt: true,
        totalRevenue: isOwnProfile, // แสดงรายได้เฉพาะเจ้าของโปรไฟล์
        _count: {
          select: {
            products: true,
            purchases: true,
            reviews: isOwnProfile,
          },
        },
        nameChanges: isOwnProfile ? {
          orderBy: { createdAt: 'desc' },
          take: 1,
        } : undefined,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json({
      profile,
      canChangeName: isOwnProfile && (!profile.nameChanges?.[0] || 
        new Date(profile.nameChanges[0].createdAt).getTime() + (15 * 24 * 60 * 60 * 1000) < Date.now()
      ),
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const {
      name,
      bio,
      website,
      github,
      twitter,
      nameChanged = false,
    } = await req.json();

    // ตรวจสอบว่าสามารถเปลี่ยนชื่อได้หรือไม่ถ้ามีการเปลี่ยนชื่อ
    if (nameChanged) {
      const lastNameChange = await db.nameChange.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });

      const canChangeName = !lastNameChange ||
        new Date(lastNameChange.createdAt).getTime() + (15 * 24 * 60 * 60 * 1000) < Date.now();

      if (!canChangeName) {
        return NextResponse.json(
          { error: "ไม่สามารถเปลี่ยนชื่อได้ในขณะนี้" },
          { status: 403 }
        );
      }
    }

    // อัพเดทข้อมูลโปรไฟล์
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        website,
        github,
        twitter,
      },
    });

    // สร้างประวัติการเปลี่ยนชื่อถ้ามีการเปลี่ยนชื่อ
    if (nameChanged) {
      await db.nameChange.create({
        data: {
          userId: session.user.id,
          oldName: session.user.name,
          newName: name,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "อัพเดทโปรไฟล์สำเร็จ",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์" },
      { status: 500 }
    );
  }
}
