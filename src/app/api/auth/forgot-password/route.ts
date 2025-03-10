import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomBytes } from "crypto"
import { addHours } from "date-fns"
import { sendEmail, getPasswordResetEmail } from "@/lib/email"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    })

    // Don't reveal whether a user exists or not
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists with that email, we've sent a password reset link." },
        { status: 200 }
      )
    }

    // Delete any existing reset tokens for this user
    await db.passwordReset.deleteMany({
      where: {
        userId: user.id,
      },
    })

    // Create new reset token
    const token = randomBytes(32).toString("hex")
    const expires = addHours(new Date(), 1) // Token expires in 1 hour

    // Save reset token
    await db.passwordReset.create({
      data: {
        token,
        expires,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    // Send reset email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetLink = `${baseUrl}/reset-password?token=${token}`
    
    const emailSent = await sendEmail({
      to: user.email!,
      subject: "Reset Your Password - ZombitX64",
      html: getPasswordResetEmail(resetLink)
    })

    if (!emailSent && process.env.NODE_ENV === "development") {
      return NextResponse.json({
        message: "If an account exists with that email, we've sent a password reset link.",
        debug: {
          resetLink,
        },
      })
    }

    return NextResponse.json({
      message: "If an account exists with that email, we've sent a password reset link.",
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("[FORGOT_PASSWORD]", error.message)
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 }
      )
    }

    console.error("[FORGOT_PASSWORD]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
