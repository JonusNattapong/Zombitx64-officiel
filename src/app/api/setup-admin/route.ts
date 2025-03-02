import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcryptjs"

// This route should only be used once to set up the initial admin user
// It should be removed or protected in production
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: {
        role: "admin"
      }
    })

    if (existingAdmin) {
      return new NextResponse(
        JSON.stringify({ error: "Admin user already exists" }),
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "admin",
        name: "Admin User"
      }
    })

    return new NextResponse(
      JSON.stringify({ 
        message: "Admin user created successfully",
        userId: user.id 
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return new NextResponse(
      JSON.stringify({ error: "Error creating admin user" }),
      { status: 500 }
    )
  }
}
