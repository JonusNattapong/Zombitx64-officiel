import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// ตั้งค่า S3 client (AWS หรือ S3-compatible service เช่น MinIO)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // จำเป็นสำหรับบางบริการเช่น MinIO
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "datasets";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // ตรวจสอบว่าเป็น multipart/form-data
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

    // ตรวจสอบว่า dataset มีอยู่จริงและเป็นของผู้ใช้ที่ login อยู่
    const dataset = await db.dataset.findUnique({
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

    // อ่านข้อมูลไฟล์
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // สร้าง hash สำหรับไฟล์เพื่อป้องกันการอัปโหลดซ้ำ
    const fileHash = crypto.createHash("md5").update(buffer).digest("hex");

    // กำหนดชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
    const originalName = file.name;
    const fileExtension = originalName.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `datasets/${datasetId}/${fileName}`;

    // อัปโหลดไฟล์ไปยัง S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // สร้างลิงก์สำหรับเข้าถึงไฟล์
    const fileUrl = `${process.env.S3_PUBLIC_URL || ""}/${BUCKET_NAME}/${filePath}`;

    // บันทึกข้อมูลไฟล์ลงใน database
    const datasetFile = await db.datasetFile.create({
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

    // อัพเดท dataset ให้มีการเชื่อมโยงกับไฟล์
    await db.dataset.update({
      where: { id: datasetId },
      data: {
        updatedAt: new Date(),
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
      { error: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" },
      { status: 500 }
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

    // ตรวจสอบว่าไฟล์มีอยู่จริงและเป็นของผู้ใช้ที่ login อยู่
    const file = await db.datasetFile.findUnique({
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

    // ตรวจสอบสิทธิ์
    if (file.dataset.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการลบไฟล์นี้" },
        { status: 403 }
      );
    }

    // ลบไฟล์จาก S3
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.filePath,
        })
      );
    } catch (s3Error) {
      console.error("Error deleting file from S3:", s3Error);
      // ไม่ return error เพื่อให้สามารถลบข้อมูลในฐานข้อมูลได้
    }

    // ลบข้อมูลไฟล์จากฐานข้อมูล
    await db.datasetFile.delete({
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
