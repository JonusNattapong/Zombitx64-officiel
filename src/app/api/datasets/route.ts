import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    console.log("formData", formData)
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string | undefined;
    const metadata = formData.get("metadata") as string | undefined;
    const coverImage = formData.get("coverImage") as File | undefined;
    const files = formData.getAll("files") as File[];

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // TODO: Implement actual file upload to a storage service (e.g., AWS S3, Cloudinary)
    // For now, we'll just log the file names and sizes as placeholders.
    console.log("Cover Image:", coverImage?.name, coverImage?.size);
    files.forEach((file) => {
      console.log("File:", file.name, file.size);
    });

    const dataset = await prisma.dataset.create({
      data: {
        title,
        description,
        tags,
        metadata,
        userId: session.user.id,
        // Replace with actual file URLs after uploading
        coverImage: coverImage?.name,
        files: {
          createMany: {
            data: files.map((file) => ({
              filename: file.name,
              fileType: file.type,
              // Replace with actual file URL after uploading
              fileUrl: file.name, 
            })),
          },
        },
      },
    });

    return NextResponse.json(dataset, { status: 201 });
  } catch (error) {
    console.error("Error creating dataset:", error);
    return NextResponse.json(
      { error: "Failed to create dataset" },
      { status: 500 }
    );
  }
}
