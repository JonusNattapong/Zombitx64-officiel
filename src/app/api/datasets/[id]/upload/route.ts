import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import {
  isValidFileType,
  isValidFileSize,
  isValidTotalSize,
  generateDatasetFileName
} from '@/lib/dataset-utils'

const ALLOWED_FILE_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'video/mp4',
  'audio/mpeg',
  'application/zip',
  'application/x-zip-compressed'
]

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the dataset and verify ownership
    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
      include: {
        files: {
          select: { fileSize: true }
        },
        product: true // Include product relation
      }
    })

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    if (dataset.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const metadata = formData.get('metadata') // Optional metadata for each file

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate files
    for (const file of files) {
      if (!isValidFileType(file, ALLOWED_FILE_TYPES)) {
        return NextResponse.json(
          { error: `Invalid file type for file: ${file.name}` },
          { status: 400 }
        )
      }

      if (!isValidFileSize(file)) {
        return NextResponse.json(
          { error: `File size exceeds the maximum limit: ${file.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate total size including existing files
    const currentTotalSize = dataset.files.reduce((sum, file) => sum + file.fileSize, 0)
    const newFilesTotalSize = files.reduce((sum, file) => sum + file.size, 0)

    if (!isValidTotalSize(currentTotalSize, newFilesTotalSize)) {
      return NextResponse.json(
        { error: 'Total dataset size would exceed the maximum limit' },
        { status: 400 }
      )
    }

    // Process each file
    const uploadedFiles = []
    for (const file of files) {
      const fileName = generateDatasetFileName(file.name, dataset.id, session.user.id)
      
      // TODO: Upload file to storage service (e.g., AWS S3)
      // const fileUrl = await uploadToStorage(file, fileName)

      // For now, we'll use a placeholder URL
      const fileUrl = `placeholder_${fileName}`

      // Create file record in database
      const datasetFile = await prisma.datasetFile.create({
        data: {
          filename: file.name,
          fileType: file.type,
          fileUrl: fileUrl,
          fileSize: file.size,
          filePath: fileName,
          fileHash: '', // TODO: Calculate file hash
          metadata: metadata ? String(metadata) : null,
          datasetId: dataset.id
        }
      })

      uploadedFiles.push(datasetFile)
    }

    // If this is the first file(s) being uploaded, update the product's fileHash
    if (dataset.product && dataset.files.length === 0) {
      await prisma.product.update({
        where: { id: dataset.product.id },
        data: {
          fileHash: uploadedFiles[0].fileHash // Use the first file's hash
        }
      })
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}