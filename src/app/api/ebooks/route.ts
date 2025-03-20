import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { buildEbookQuery, buildEbookOrderBy, validateCreateEbook, serializeEbook, deserializeEbook, DEFAULT_PAGE_SIZE } from '@/lib/ebook-utils'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE))
    const sortBy = searchParams.get('sortBy') || undefined
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    
    const query = buildEbookQuery(Object.fromEntries(searchParams.entries()))
    const orderBy = buildEbookOrderBy(sortBy, sortOrder)

    const [ebooks, total] = await Promise.all([
      prisma.ebook.findMany({
        where: query,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          product: {
            select: {
              id: true,
              price: true,
              status: true
            }
          }
        }
      }),
      prisma.ebook.count({ where: query })
    ])

    return NextResponse.json({
      ebooks: ebooks.map(deserializeEbook),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching ebooks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json()
    const validatedData = validateCreateEbook(data)
    const serializedData = serializeEbook(validatedData)

    // Create ebook
    const ebook = await prisma.ebook.create({
      data: {
        ...serializedData,
        userId: session.user.id,
        // If this is a paid ebook, create a product for it
        ...(validatedData.licenseType === 'PAID' && data.price ? {
          product: {
            create: {
              name: validatedData.title,
              description: validatedData.description,
              price: data.price,
              category: validatedData.category,
              productType: 'EBOOK',
              status: 'AVAILABLE',
              fileHash: '', // Will be updated when file is uploaded
              version: '1.0',
              ownerId: session.user.id
            }
          }
        } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            price: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(deserializeEbook(ebook))
  } catch (error: any) {
    console.error('Error creating ebook:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}