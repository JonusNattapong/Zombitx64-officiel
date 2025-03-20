import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for E-book metadata
const ebookSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").max(100, "Title must not exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()),
  language: z.string().min(1, "Language is required"),
  author: z.string().min(1, "Author is required"),
  publishYear: z.string(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  pages: z.string().optional(),
  tableOfContents: z.string().optional(),
  sampleContent: z.string().optional(),
  licenseType: z.string().min(1, "License type is required"),
  visibility: z.enum(["public", "private", "unlisted"]),
  pricingModel: z.enum(["one-time", "subscription", "free"]),
  subscriptionPeriod: z.string().optional(),
  price: z.number().min(0, "Price must not be negative"),
  allowPreview: z.boolean().default(false),
  userId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await req.json();

    // Validate request body against schema
    const validatedData = ebookSchema.parse({
      ...data,
      userId: session.user.id // Ensure userId matches the authenticated user
    });

    // Validate pricing model constraints
    if (validatedData.pricingModel === "subscription" && !validatedData.subscriptionPeriod) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Subscription period is required for subscription pricing model" 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (validatedData.pricingModel === "free" && validatedData.price !== 0) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Price must be 0 for free E-books" 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create E-book record with metadata
    const ebook = await db.ebook.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        author: validatedData.author,
        language: validatedData.language,
        publishYear: validatedData.publishYear,
        publisher: validatedData.publisher,
        isbn: validatedData.isbn,
        pages: validatedData.pages,
        tableOfContents: validatedData.tableOfContents,
        sampleContent: validatedData.sampleContent,
        licenseType: validatedData.licenseType,
        visibility: validatedData.visibility,
        allowPreview: validatedData.allowPreview,
        userId: validatedData.userId,
        status: "pending", // Initial status before files are uploaded
        createdAt: new Date(),
        lastUpdated: new Date(),
      },
    });

    return new NextResponse(
      JSON.stringify({ 
        message: "E-book metadata saved successfully",
        ebookId: ebook.id 
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("E-book creation error:", error);

    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          error: "Validation error",
          details: error.errors
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Get E-book metadata
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const ebookId = searchParams.get('id');

  if (!session?.user?.id) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!ebookId) {
    return new NextResponse(
      JSON.stringify({ error: "E-book ID is required" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const ebook = await db.ebook.findUnique({
      where: { id: ebookId },
      include: {
        product: true, // Include associated marketplace product
      },
    });

    if (!ebook) {
      return new NextResponse(
        JSON.stringify({ error: "E-book not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has permission to view this E-book
    if (ebook.userId !== session.user.id && ebook.visibility === "private") {
      return new NextResponse(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ ebook }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("E-book fetch error:", error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
