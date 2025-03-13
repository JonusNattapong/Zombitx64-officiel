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

    // Fetch dashboard statistics
    const [
      totalSales,
      totalProducts,
      activeListings,
      recentTransactions
    ] = await Promise.all([
      // Calculate total sales
      prisma.transaction.aggregate({
        where: {
          sellerId: session.user.id,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Count total products
      prisma.product.count({
        where: {
          sellerId: session.user.id
        }
      }),
      
      // Count active listings
      prisma.product.count({
        where: {
          sellerId: session.user.id,
          status: 'ACTIVE'
        }
      }),
      
      // Get recent transactions
      prisma.transaction.findMany({
        where: {
          OR: [
            { sellerId: session.user.id },
            { buyerId: session.user.id }
          ],
          status: 'COMPLETED'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          createdAt: true,
          status: true,
          product: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      totalSales: totalSales._sum.amount || 0,
      totalProducts,
      activeListings,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        amount: t.amount,
        date: t.createdAt,
        status: t.status,
        productName: t.product.name
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 