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
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/epub+zip': '.epub',
  'application/x-mobipocket-ebook': '.mobi'
};

// Type definition for custom error
interface UploadError extends Error {
  code?: string;
}

// Helper function to validate file type
function isValidFileType(file: File): boolean {
  return Object.keys(ACCEPTED_MIME_TYPES).includes(file.type);
}

// Helper function to validate file size
function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
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
      JSON.stringify({ error: "Too many requests", details: error instanceof Error ? error.message : "Rate limit exceeded" }), 
      { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const formData = await req.formData();
    const ebookId = formData.get("ebookId") as string;
    const file = formData.get("file") as File;
    const isPreview = formData.get("isPreview") === "true";

    if (!ebookId || !file) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file type
    if (!isValidFileType(file)) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid file type",
          acceptedTypes: Object.values(ACCEPTED_MIME_TYPES).join(', ')
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file size
    const maxSize = isPreview ? 10 * 1024 * 1024 : MAX_FILE_SIZE;
    if (!isValidFileSize(file, maxSize)) {
      return new NextResponse(
        JSON.stringify({ 
          error: "File size exceeds limit",
          maxSize: `${maxSize / (1024 * 1024)}MB`
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize filename and create unique name
    const sanitizedFileName = sanitizeFilename(file.name);
    const fileName = `${uuidv4()}-${sanitizedFileName}`;
    const filePath = `ebooks/${ebookId}/${isPreview ? 'preview' : 'file'}/${fileName}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Prepare upload parameters with additional security headers
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: bytes,
      ContentType: file.type,
      ContentDisposition: 'attachment',
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

    const fileUrl = `${process.env.S3_PUBLIC_URL || ''}/${BUCKET_NAME}/${filePath}`;

    // Update database with file information
    await db.ebook.update({
      where: { id: ebookId },
      data: {
        ...(isPreview ? { previewUrl: fileUrl } : { fileUrl: fileUrl }),
        lastUpdated: new Date(),
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return new NextResponse(
      JSON.stringify({ 
        message: "E-book file uploaded successfully",
        fileUrl
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("E-book file upload error:", error);
    
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
