import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"
import { authenticator } from "otplib"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate 2FA secret
    // const twoFactorSecret = authenticator.generateSecret(); // Removed for now

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        twoFactorEnabled: false, 
        // twoFactorSecret, // Removed for now
      },
    })

    // Generate QR code data URL
    // const otpauthUrl = authenticator.keyuri(
    //   user.email!, // Add ! to assert email is not null
    //   "Zombitx64",
    //   twoFactorSecret
    // );
    // const qrCodeDataUrl = await authenticator.toDataURL(otpauthUrl); // Removed for now

    // Remove sensitive data from response. Also remove the import of UserRole
    const { password: _, ...userWithoutSensitiveData } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutSensitiveData,
        // qrCodeDataUrl, // Removed for now
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
