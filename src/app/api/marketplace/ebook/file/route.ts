import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await req.formData();
    const ebookId = formData.get("ebookId") as string;
    const file = formData.get("file") as File;
    const isPreview = formData.get("isPreview") === "true";

    if (!ebookId || !file) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `ebooks/${ebookId}/${isPreview ? 'preview' : 'file'}/${fileName}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: bytes,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `${process.env.S3_PUBLIC_URL || ""}/${BUCKET_NAME}/${filePath}`;

    await db.ebook.update({
      where: { id: ebookId },
      data: {
        ...(isPreview ? { previewUrl: fileUrl } : { fileUrl: fileUrl }),
      },
    });

    return new NextResponse("E-book file uploaded successfully", { status: 200 });
  } catch (error) {
    console.error("E-book file upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
