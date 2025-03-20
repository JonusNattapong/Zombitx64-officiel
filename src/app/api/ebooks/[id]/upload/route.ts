import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isValidFileType, MAX_FILE_SIZE } from '@/lib/ebook-utils'

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

    // Get the ebook and verify ownership
    const ebook = await prisma.ebook.findUnique({
      where: { id: params.id }
    })

    if (!ebook) {
      return NextResponse.json(
        { error: 'Ebook not found' },
        { status: 404 }
      )
    }

    if (ebook.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (!isValidFileType(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and EPUB files are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit (100MB)' },
        { status: 400 }
      )
    }

    // TODO: Upload file to storage service (e.g., AWS S3)
    // const fileUrl = await uploadFile(file)

    // For now, we'll just update the ebook with a placeholder URL
    const updatedEbook = await prisma.ebook.update({
      where: { id: params.id },
      data: {
        fileUrl: `placeholder_${file.name}` // Replace with actual file URL after implementing file upload
      }
    })

    return NextResponse.json({
      message: 'File uploaded successfully',
      ebook: updatedEbook
    })
  } catch (error) {
    console.error('Error uploading ebook file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}