import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db'; // Corrected import
import csv from 'csv-parser';
import stream from 'stream';

// Helper function to parse CSV and return a preview
async function parseCSV(file: File): Promise<object[]> {
  return new Promise((resolve, reject) => {
    const results: object[] = [];
    const fileStream = stream.Readable.fromWeb(file.stream() as any);

    fileStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results.slice(0, 5))) // Limit to first 5 rows for preview
      .on('error', (error) => reject(error));
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string | undefined;
    const metadata = formData.get('metadata') as string | undefined;
    const coverImage = formData.get('coverImage') as File | undefined;
    const files = formData.getAll('files') as File[];
    const category = formData.get('category') as string; // Get category from form data
    const price = parseFloat(formData.get('price') as string); // Get and parse price
    if (!title || !description || isNaN(price) || !category) {
      return NextResponse.json(
        { error: 'Title, description, price, and category are required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual file upload to a storage service (e.g., AWS S3, Cloudinary)
    // For now, we'll just log the file names and sizes as placeholders.
    console.log('Cover Image:', coverImage?.name, coverImage?.size);
    files.forEach((file) => {
      console.log('File:', file.name, file.size, file.type);
    });

    // Create the dataset
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

    // Find a CSV file for preview
    let preview = null;
    for (const file of files) {
      if (file.type === 'text/csv') {
        preview = await parseCSV(file);
        break; // Stop after the first CSV file
      }
    }

    // Create a product associated with the dataset
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        category,
        fileHash: 'placeholder', // Replace with actual file hash
        version: '1.0.0',
        ownerId: session.user.id,
        datasetId: dataset.id,
        extendedMetrics: preview ? JSON.stringify({ preview }) : null, // Store preview
      },
    });

    return NextResponse.json({ dataset, product }, { status: 201 });
  } catch (error) {
    console.error('Error creating dataset:', error);
    return NextResponse.json(
      { error: 'Failed to create dataset' },
      { status: 500 }
    );
  }
}
