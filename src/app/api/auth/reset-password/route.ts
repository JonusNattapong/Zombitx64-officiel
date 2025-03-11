import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import { isAfter } from "date-fns"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await db.passwordReset.findUnique({
      where: {
        token,
        AND: {
          used: false,
          expires: {
            gt: new Date(),
          },
        },
      },
      include: {
        user: true,
      },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password and mark token as used
    await db.$transaction([
      db.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),
      db.passwordReset.update({
        where: {
          id: resetToken.id,
        },
        data: {
          used: true,
        },
      }),
      db.activityLog.create({
        data: {
          userId: resetToken.userId,
          type: "password_reset",
          description: "Password was reset successfully",
        },
      }),
    ])

    return NextResponse.json({
      message: "Password reset successful",
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("[RESET_PASSWORD]", error.message)
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 }
      )
    }

    console.error("[RESET_PASSWORD]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
