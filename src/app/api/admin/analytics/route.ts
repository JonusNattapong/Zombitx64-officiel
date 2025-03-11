import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const totalUsers = await db.user.count();
    const newUsers = await db.user.count({
      where: {
        createdAt: {
          gte: subDays(new Date(), 7),
        },
      },
    });
    const activeUsers = await db.user.count({
      where: {
        activity: {
          contains: 'login', // Assuming activity contains login events
        },
        updatedAt: {
          gte: subDays(new Date(), 30),
        }
      }
    });

    const totalProducts = await db.product.count();
    const newProducts = await db.product.count({
      where: {
        createdAt: {
          gte: subDays(new Date(), 7),
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      newUsers,
      activeUsers,
      totalProducts,
      newProducts
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Could not fetch analytics" }),
      { status: 500 }
    );
  }
}
