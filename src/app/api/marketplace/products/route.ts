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
      price,
      category,
      tags,
      datasetId,
      pricingModel = "one-time",
      subscriptionPeriod = null,
      version = "1.0",
    } = await req.json();

    if (!title || !description || price === undefined || !category || !datasetId) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า dataset มีอยู่จริงและเป็นของผู้ใช้ที่ login
    const dataset = await db.dataset.findUnique({
      where: {
        id: datasetId,
        userId: session.user.id,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "ไม่พบ dataset หรือคุณไม่มีสิทธิ์ในการสร้างสินค้าจาก dataset นี้" },
        { status: 403 }
      );
    }

    // สร้างสินค้าใหม่
    const productType = price > 0 ? (pricingModel === "subscription" ? "subscription" : "paid") : "free";
    
    const product = await db.product.create({
      data: {
        title,
        description,
        price,
        category,
        tags: tags || [],
        ownerId: session.user.id,
        datasetId,
        productType,
        version,
        status: "ACTIVE",
        metrics: JSON.stringify({
          files: await db.datasetFile.count({ where: { datasetId } }),
          sizes: await db.datasetFile.aggregate({
            where: { datasetId },
            _sum: { fileSize: true },
          }),
          uploadDate: new Date(),
        }),
      },
    });

    // อัพเดท dataset เพื่อเชื่อมโยงกับสินค้า
    await db.dataset.update({
      where: { id: datasetId },
      data: {
        productId: product.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "สร้างสินค้าสำเร็จ",
      productId: product.id,
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างสินค้า" },
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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000");
    const ownerId = searchParams.get("ownerId");
    const productType = searchParams.get("productType");

    // คำนวณ skip สำหรับการแบ่งหน้า
    const skip = (page - 1) * limit;

    // สร้าง query
    let whereClause: any = {
      status: "ACTIVE", // แสดงเฉพาะสินค้าที่เปิดใช้งาน
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    if (category) {
      whereClause.category = category;
    }

    if (productType) {
      whereClause.productType = productType;
    }

    if (ownerId) {
      whereClause.ownerId = ownerId;
    }

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

    // สร้างตัวเรียงลำดับ
    let orderBy: any = {};
    switch (sortBy) {
      case "price":
        orderBy.price = sortOrder;
        break;
      case "sales":
        orderBy.sales = sortOrder;
        break;
      case "rating":
        orderBy.rating = sortOrder;
        break;
      case "title":
        orderBy.title = sortOrder;
        break;
      case "createdAt":
      default:
        orderBy.createdAt = sortOrder;
    }

    // ดึงข้อมูลสินค้า
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          dataset: {
            select: {
              id: true,
              coverImage: true,
              files: {
                select: {
                  id: true,
                  filename: true,
                  fileType: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({
        where: whereClause,
      }),
    ]);

    // คำนวณคะแนนเฉลี่ยสำหรับแต่ละสินค้า
    const productsWithRating = await Promise.all(
      products.map(async (product) => {
        const avgRating = await db.review.aggregate({
          where: { revieweeId: product.id },
          _avg: { rating: true },
        });

        return {
          ...product,
          avgRating: avgRating._avg.rating || 0,
          reviewCount: product._count.reviews,
        };
      })
    );

    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      filters: {
        categories: await db.product.groupBy({
          by: ["category"],
          where: { status: "ACTIVE" },
          _count: true,
        }),
        priceRange: {
          min: await db.product.aggregate({
            where: { status: "ACTIVE" },
            _min: { price: true },
          }),
          max: await db.product.aggregate({
            where: { status: "ACTIVE" },
            _max: { price: true },
          }),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" },
      { status: 500 }
    );
  }
}
