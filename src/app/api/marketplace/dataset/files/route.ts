import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Initialize S3 client with error handling
let s3Client: S3Client;
try {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  });
} catch (error) {
  console.error("Failed to initialize S3 client:", error);
  // Will throw error when accessed if not properly initialized
}

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "datasets";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  try {
    // Validate S3 configuration
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.S3_ENDPOINT) {
      throw new Error("S3 configuration is missing");
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Verify content type
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "ต้องใช้ multipart/form-data สำหรับการอัปโหลดไฟล์" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const datasetId = formData.get("datasetId") as string;

    if (!file || !datasetId) {
      return NextResponse.json(
        { error: "กรุณาระบุไฟล์และ datasetId" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ขนาดไฟล์ต้องไม่เกิน 100MB" },
        { status: 400 }
      );
    }

    // Check dataset ownership
    const dataset = await prisma.dataset.findUnique({
      where: {
        id: datasetId,
        userId: session.user.id,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "ไม่พบ dataset หรือคุณไม่มีสิทธิ์ในการอัปโหลดไฟล์ไปยัง dataset นี้" },
        { status: 403 }
      );
    }

    // Read and hash file
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    const fileHash = crypto.createHash("md5").update(buffer).digest("hex");

    // Check for duplicate files
    const existingFile = await prisma.datasetFile.findFirst({
      where: {
        datasetId,
        fileHash,
      },
    });

    if (existingFile) {
      return NextResponse.json(
        { error: "ไฟล์นี้ถูกอัปโหลดไปแล้ว" },
        { status: 409 }
      );
    }

    // Generate unique filename
    const originalName = file.name;
    const fileExtension = originalName.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `datasets/${datasetId}/${fileName}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
    } catch (s3Error) {
      console.error("S3 upload error:", s3Error);
      throw new Error("ไม่สามารถอัปโหลดไฟล์ไปยัง storage ได้");
    }

    const fileUrl = `${process.env.S3_PUBLIC_URL || ""}/${BUCKET_NAME}/${filePath}`;

    // Create file record in database
    const datasetFile = await prisma.datasetFile.create({
      data: {
        datasetId,
        filename: originalName,
        fileUrl,
        fileType: fileExtension || "",
        fileSize: buffer.length,
        filePath,
        fileHash,
        metadata: JSON.stringify({
          contentType: file.type,
          uploadedAt: new Date(),
        }),
      },
    });

    // Update dataset
    await prisma.dataset.update({
      where: { id: datasetId },
      data: {
        updatedAt: new Date(),
        status: "PROCESSING", // Add status to track processing state
      },
    });

    return NextResponse.json({
      success: true,
      message: "อัปโหลดไฟล์สำเร็จ",
      file: {
        id: datasetFile.id,
        filename: datasetFile.filename,
        fileUrl: datasetFile.fileUrl,
        fileType: datasetFile.fileType,
        fileSize: datasetFile.fileSize,
      },
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json(
        { error: "กรุณาระบุ ID ไฟล์ที่ต้องการลบ" },
        { status: 400 }
      );
    }

    const file = await prisma.datasetFile.findUnique({
      where: {
        id: fileId,
      },
      include: {
        dataset: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 404 });
    }

    if (file.dataset.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการลบไฟล์นี้" },
        { status: 403 }
      );
    }

    // Delete from S3
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.filePath,
        })
      );
    } catch (s3Error) {
      console.error("Error deleting file from S3:", s3Error);
    }

    // Delete from database
    await prisma.datasetFile.delete({
      where: {
        id: fileId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบไฟล์สำเร็จ",
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบไฟล์" },
      { status: 500 }
    );
  }
}
