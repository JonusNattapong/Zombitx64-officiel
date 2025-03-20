import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { validateUpdateDataset, serializeDataset, deserializeDataset } from '@/lib/dataset-utils'
import { authOptions } from '@/lib/auth'

// GET /api/datasets/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
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
            fileSize: true,
            fileUrl: true,
            metadata: true
          }
        }
      }
    })

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deserializeDataset(dataset))
  } catch (error) {
    console.error('Error fetching dataset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/datasets/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
      include: { product: true }
    })

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    if (dataset.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = validateUpdateDataset({ ...body, id: params.id })
    const serializedData = serializeDataset(validatedData)

    // Update dataset and its associated product if it exists
    const updatedDataset = await prisma.dataset.update({
      where: { id: params.id },
      data: {
        ...serializedData,
        ...(dataset.product && validatedData.price ? {
          product: {
            update: {
              name: validatedData.title || dataset.title,
              description: validatedData.description || dataset.description,
              price: validatedData.price
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
        },
        files: {
          select: {
            id: true,
            filename: true,
            fileType: true,
            fileSize: true,
            fileUrl: true,
            metadata: true
          }
        }
      }
    })

    return NextResponse.json(deserializeDataset(updatedDataset))
  } catch (error: any) {
    console.error('Error updating dataset:', error)
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

// DELETE /api/datasets/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
      include: { files: true }
    })

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    if (dataset.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete associated files first
    if (dataset.files.length > 0) {
      // TODO: Delete files from storage service
      await prisma.datasetFile.deleteMany({
        where: { datasetId: params.id }
      })
    }

    // Delete the dataset and its associated product
    await prisma.dataset.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Dataset deleted successfully' })
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}