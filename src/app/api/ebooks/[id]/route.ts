import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { validateUpdateEbook, serializeEbook, deserializeEbook } from '@/lib/ebook-utils'
import { authOptions } from '@/lib/auth'

// GET /api/ebooks/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ebook = await prisma.ebook.findUnique({
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
        }
      }
    })

    if (!ebook) {
      return NextResponse.json(
        { error: 'Ebook not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deserializeEbook(ebook))
  } catch (error) {
    console.error('Error fetching ebook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/ebooks/[id]
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

    const ebook = await prisma.ebook.findUnique({
      where: { id: params.id },
      include: {
        product: true
      }
    })

    if (!ebook) {
      return NextResponse.json(
        { error: 'Ebook not found' },
        { status: 404 }
      )
    }

    if (ebook.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await req.json()
    const validatedData = validateUpdateEbook({ ...data, id: params.id })
    const serializedData = serializeEbook(validatedData)

    // If this is a paid ebook and has a product, update the product too
    let updateData: any = {
      ...serializedData
    }

    if (ebook.product && validatedData.licenseType === 'PAID' && data.price) {
      updateData.product = {
        update: {
          name: validatedData.title,
          description: validatedData.description,
          price: data.price,
          category: validatedData.category
        }
      }
    }

    const updatedEbook = await prisma.ebook.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(deserializeEbook(updatedEbook))
  } catch (error: any) {
    console.error('Error updating ebook:', error)
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

// DELETE /api/ebooks/[id]
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

    const ebook = await prisma.ebook.findUnique({
      where: { id: params.id }
    })

    if (!ebook) {
      return NextResponse.json(
        { error: 'Ebook not found' },
        { status: 404 }
      )
    }

    if (ebook.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete the associated product if it exists
    if (ebook.productId) {
      await prisma.product.delete({
        where: { id: ebook.productId }
      })
    }

    await prisma.ebook.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Ebook deleted successfully' })
  } catch (error) {
    console.error('Error deleting ebook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}