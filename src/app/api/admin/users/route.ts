import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        walletAddress: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Could not fetch users" }),
      { status: 500 }
    );
  }
}
