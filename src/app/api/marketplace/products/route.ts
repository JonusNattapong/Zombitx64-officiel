import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const {
      name,
      description,
      price,
      category,
      tags,
      datasetId,
      pricingModel = "one-time",
      subscriptionPeriod = null,
      version = "1.0",
    } = await req.json();

    if (!name || !description || price === undefined || !category || !datasetId) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า dataset มีอยู่จริงและเป็นของผู้ใช้ที่ login
    const dataset = await prisma.dataset.findUnique({
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
    const fileHash = randomBytes(32).toString('hex');

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        fileHash,
        tags: typeof tags === 'string' ? tags : Array.isArray(tags) ? tags.join(',') : '',
        ownerId: session.user.id,
        datasetId,
        productType,
        version,
        status: "AVAILABLE",
        metrics: JSON.stringify({
          files: await prisma.datasetFile.count({ where: { datasetId } }),
          uploadDate: new Date(),
        }),
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'product_created',
        title: 'Product Created',
        message: `Created product: ${name}`,
        data: JSON.stringify({ productId: product.id }),
        read: false
      }
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

    const skip = (page - 1) * limit;

    let whereClause: any = {
      status: "AVAILABLE",
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    if (category) {
      whereClause.category = category.toLowerCase();
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
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
        {
          tags: {
            contains: search,
          },
        },
      ];
    }

    let orderBy: any = {};
    switch (sortBy) {
      case "price":
        orderBy.price = sortOrder;
        break;
      case "name":
        orderBy.name = sortOrder;
        break;
      case "createdAt":
      default:
        orderBy.createdAt = sortOrder;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
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
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: products.map(product => ({
        ...product,
        metrics: product.metrics ? JSON.parse(product.metrics) : null,
        tags: product.tags ? product.tags.split(',') : []
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      filters: {
        categories: await prisma.product.groupBy({
          by: ["category"],
          where: { status: "AVAILABLE" },
          _count: true,
        }),
        priceRange: {
          min: await prisma.product.aggregate({
            where: { status: "AVAILABLE" },
            _min: { price: true },
          }),
          max: await prisma.product.aggregate({
            where: { status: "AVAILABLE" },
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
