import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const notificationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional()
});

const MAX_NOTIFICATIONS = 100;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Mark notifications as read in a separate transaction
    await prisma.$transaction(async (tx) => {
      await tx.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: {
          read: true
        }
      });
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    
    try {
      const validatedData = notificationSchema.parse(body);
      
      // Check notification limit
      const count = await prisma.notification.count({
        where: { userId: validatedData.userId }
      });
      
      if (count >= MAX_NOTIFICATIONS) {
        // Delete oldest notification if limit reached
        await prisma.notification.deleteMany({
          where: { userId: validatedData.userId },
          orderBy: { createdAt: 'asc' },
          take: 1
        });
      }

      const notification = await prisma.notification.create({
        data: validatedData
      });

      return NextResponse.json(notification);
    } catch (validationError) {
      return new NextResponse('Invalid notification data', { status: 400 });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return new NextResponse('Notification ID is required', { status: 400 });
    }

    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== session.user.id) {
      return new NextResponse('Notification not found', { status: 404 });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 