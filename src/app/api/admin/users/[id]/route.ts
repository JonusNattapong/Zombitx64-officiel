import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, email, role } = body;

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Could not update user" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Could not delete user" }),
      { status: 500 }
    );
  }
}
