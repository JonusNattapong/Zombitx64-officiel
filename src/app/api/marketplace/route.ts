import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma, Product } from '@prisma/client';

interface ProductWithOwner extends Product {
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    const productType = searchParams.get('productType');

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = category.toLowerCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (productType) {
      where.productType = productType;
    }

    // Build order by
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Fetch products and count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format response
    const formattedProducts = products.map((product: ProductWithOwner) => ({
      ...product,
      metrics: product.metrics ? JSON.parse(product.metrics) : null,
      extendedMetrics: product.extendedMetrics
        ? JSON.parse(product.extendedMetrics)
        : null,
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    });
  } catch (error) {
    console.error('Marketplace GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const {
      name,
      description,
      price,
      fileHash,
      category,
      tags,
      metrics,
      extendedMetrics,
      productType,
      datasetId,
    } = data;

    // Validate required fields
    if (!name || !description || !price || !fileHash || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        fileHash,
        category: category.toLowerCase(),
        productType,
        datasetId,
        tags: typeof tags === 'string' ? tags : Array.isArray(tags) ? tags.join(',') : '',
        metrics: metrics ? JSON.stringify(metrics) : null,
        extendedMetrics: extendedMetrics ? JSON.stringify(extendedMetrics) : null,
        version: '1.0.0',
        ownerId: session.user.id,
        status: 'AVAILABLE'
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'product_created',
        title: 'Product Created',
        message: `Created product: ${name}`,
        data: JSON.stringify({ productId: product.id }),
        read: false,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Marketplace POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
