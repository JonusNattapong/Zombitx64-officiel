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
    const coverImage = formData.get("coverImage") as File;

    if (!ebookId || !coverImage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const buffer = await coverImage.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const fileName = `${uuidv4()}-${coverImage.name}`;
    const filePath = `ebooks/${ebookId}/cover-image/${fileName}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: bytes,
      ContentType: coverImage.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `${process.env.S3_PUBLIC_URL || ""}/${BUCKET_NAME}/${filePath}`;

    await db.ebook.update({
      where: { id: ebookId },
      data: {
        coverImage: fileUrl,
      },
    });

    return new NextResponse("Cover image uploaded successfully", { status: 200 });
  } catch (error) {
    console.error("Cover image upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
