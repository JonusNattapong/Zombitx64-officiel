import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { 
      title, 
      description, 
      category, 
      tags, 
      userId, 
      visibility = "public",
      metadata = {},
    } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของ userId ที่ส่งมาหรือไม่ (ป้องกัน data tampering)
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "ไม่ได้รับอนุญาตให้สร้าง dataset สำหรับผู้ใช้อื่น" },
        { status: 403 }
      );
    }

    // สร้าง dataset ในฐานข้อมูล
    const dataset = await db.dataset.create({
      data: {
        title,
        description,
        userId,
        visibility,
        tags: tags || [],
        metadata: JSON.stringify(metadata),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "สร้าง Dataset สำเร็จ",
      datasetId: dataset.id 
    });
  } catch (error: any) {
    console.error("Error creating dataset:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง dataset" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const visibility = searchParams.get("visibility");
    const userId = searchParams.get("userId");

    // คำนวณ skip สำหรับการหน้า
    const skip = (page - 1) * limit;

    // สร้าง query
    let whereClause: any = {
      visibility: "public", // ค่าเริ่มต้นแสดงเฉพาะ datasets สาธารณะ
    };

    // ถ้ามีการระบุ visibility
    if (visibility) {
      whereClause.visibility = visibility;
    }

    // ถ้ามีการค้นหาตาม category
    if (category) {
      whereClause.category = category;
    }

    // ถ้ามีการค้นหาด้วยคำ
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ];
    }

    // ถ้ามีการค้นหาตามผู้ใช้
    if (userId) {
      whereClause.userId = userId;

      // ถ้าเป็นการค้นหาของผู้ใช้เอง อนุญาตให้ดูทั้ง public และ private
      const session = await getServerSession(authOptions);
      if (session && session.user.id === userId) {
        delete whereClause.visibility;
      }
    }

    // ดึงข้อมูล datasets
    const [datasets, totalCount] = await Promise.all([
      db.dataset.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          product: {
            select: {
              id: true,
              price: true,
              productType: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.dataset.count({
        where: whereClause,
      }),
    ]);

    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      datasets,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching datasets:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล datasets" },
      { status: 500 }
    );
  }
}
