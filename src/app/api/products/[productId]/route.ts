import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Verify product ownership
    const product = await prisma.product.findUnique({
      where: {
        id: params.productId,
        sellerId: session.user.id
      }
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: params.productId
      },
      data: {
        status
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify product ownership
    const product = await prisma.product.findUnique({
      where: {
        id: params.productId,
        sellerId: session.user.id
      }
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    await prisma.product.delete({
      where: {
        id: params.productId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 