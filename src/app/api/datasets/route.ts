import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  buildDatasetQuery,
  buildDatasetOrderBy,
  validateCreateDataset,
  serializeDataset,
  deserializeDataset,
  DEFAULT_PAGE_SIZE
} from '@/lib/dataset-utils'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE))
    const sortBy = searchParams.get('sortBy') || undefined
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as Prisma.SortOrder
    
    const query = buildDatasetQuery(Object.fromEntries(searchParams.entries()))
    const orderBy = {
      [sortBy || 'createdAt']: sortOrder
    } as Prisma.DatasetOrderByWithRelationInput

    const [datasets, total] = await Promise.all([
      prisma.dataset.findMany({
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
          },
          files: {
            select: {
              id: true,
              filename: true,
              fileType: true,
              fileSize: true
            }
          }
        }
      }),
      prisma.dataset.count({ where: query })
    ])

    return NextResponse.json({
      datasets: datasets.map(deserializeDataset),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching datasets:', error)
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

    const body = await req.json()
    const validatedData = validateCreateDataset(body)
    const serializedData = serializeDataset(validatedData)

    // Create base dataset data
    const datasetData: Prisma.DatasetCreateInput = {
      title: validatedData.title,
      description: validatedData.description,
      tags: serializedData.tags,
      metadata: serializedData.metadata,
      status: 'PENDING',
      coverImage: validatedData.coverImage,
      user: {
        connect: { id: session.user.id }
      }
    }

    // If it's a paid dataset, create a product
    if (validatedData.licenseType === 'PAID' && body.price) {
      datasetData.product = {
        create: {
          name: validatedData.title,
          description: validatedData.description,
          price: body.price,
          category: 'DATASET',
          productType: 'DATASET',
          status: 'AVAILABLE',
          fileHash: '',
          version: '1.0',
          owner: {
            connect: { id: session.user.id }
          }
        }
      }
    }

    const dataset = await prisma.dataset.create({
      data: datasetData,
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

    return NextResponse.json(deserializeDataset(dataset))
  } catch (error: any) {
    console.error('Error creating dataset:', error)
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
