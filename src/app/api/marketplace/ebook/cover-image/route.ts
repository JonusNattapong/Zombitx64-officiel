import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand, S3Client, ServerSideEncryption } from "@aws-sdk/client-s3";
import { checkRateLimit } from "@/lib/rate-limit";
import sanitizeFilename from "sanitize-filename";

// Initialize S3 client with proper type checking
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png'
};

interface UploadError extends Error {
  code?: string;
}

function isValidImageType(file: File): boolean {
  return Object.keys(ACCEPTED_MIME_TYPES).includes(file.type);
}

function isValidFileSize(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Rate limiting
  try {
    await checkRateLimit(req);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ 
        error: "Too many requests", 
        details: error instanceof Error ? error.message : "Rate limit exceeded" 
      }), 
      { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const formData = await req.formData();
    const ebookId = formData.get("ebookId") as string;
    const coverImage = formData.get("coverImage") as File;

    if (!ebookId || !coverImage) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate image type
    if (!isValidImageType(coverImage)) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid image type",
          acceptedTypes: Object.values(ACCEPTED_MIME_TYPES).join(', ')
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file size
    if (!isValidFileSize(coverImage)) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Image size exceeds limit",
          maxSize: `${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Process and optimize the image
    const buffer = await coverImage.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Sanitize filename and create unique name
    const sanitizedFileName = sanitizeFilename(coverImage.name);
    const fileName = `${uuidv4()}-${sanitizedFileName}`;
    const filePath = `ebooks/${ebookId}/cover-image/${fileName}`;

    // Prepare upload parameters with additional security headers
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: bytes,
      ContentType: coverImage.type,
      ContentDisposition: 'inline',
      ServerSideEncryption: 'AES256' as ServerSideEncryption,
      Metadata: {
        'original-filename': sanitizedFileName,
        'upload-date': new Date().toISOString(),
        'user-id': session.user.id,
      },
    };

    // Implement retry logic for S3 upload
    const MAX_RETRIES = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error during upload');
        if (attempt === MAX_RETRIES) {
          throw lastError;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    const imageUrl = `${process.env.S3_PUBLIC_URL || ''}/${BUCKET_NAME}/${filePath}`;

    // Update database with cover image URL
    await db.ebook.update({
      where: { id: ebookId },
      data: {
        coverImageUrl: imageUrl,
        lastUpdated: new Date(),
      },
    });

    return new NextResponse(
      JSON.stringify({ 
        message: "Cover image uploaded successfully",
        imageUrl 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Cover image upload error:", error);
    
    const uploadError = error as UploadError;
    return new NextResponse(
      JSON.stringify({ 
        error: uploadError.message || "Internal Server Error",
        code: uploadError.code || 'UNKNOWN_ERROR'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
