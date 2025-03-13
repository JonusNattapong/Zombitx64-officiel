import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        name: true,
        email: true,
        settings: {
          select: {
            promptpayId: true,
            currency: true
          }
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      promptpayId: user.settings?.promptpayId || '',
      currency: user.settings?.currency || 'THB'
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, promptpayId, currency } = body;

    // Update user name
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name
      }
    });

    // Update or create user settings
    await prisma.userSettings.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        promptpayId,
        currency
      },
      create: {
        userId: session.user.id,
        promptpayId,
        currency
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 