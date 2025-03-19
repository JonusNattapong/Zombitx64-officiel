import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      title, 
      description, 
      category, 
      tags, 
      language, 
      author, 
      publishYear, 
      publisher, 
      isbn, 
      pages, 
      tableOfContents, 
      sampleContent,
      visibility,
      licenseType,
      userId,
    } = body;

    if (!title || !description || !category || !language || !author) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const ebook = await db.ebook.create({
      data: {
        title,
        description,
        category,
        tags,
        language,
        author,
        publishYear,
        publisher,
        isbn,
        pages,
        tableOfContents,
        sampleContent,
        visibility,
        licenseType,
        userId,
      },
    });

    return NextResponse.json({ ebookId: ebook.id }, { status: 201 });
  } catch (error) {
    console.error("E-book creation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
