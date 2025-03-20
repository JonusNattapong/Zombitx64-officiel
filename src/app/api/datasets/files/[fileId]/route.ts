import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// DELETE /api/datasets/files/[fileId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const fileId = params.fileId

    const datasetFile = await prisma.datasetFile.findUnique({
      where: { id: fileId },
      include: { dataset: true }
    })

    if (!datasetFile) {
      return NextResponse.json(
        { error: 'Dataset file not found' },
        { status: 404 }
      )
    }

    if (datasetFile.dataset.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // TODO: Delete file from storage service (e.g., AWS S3)
    // await deleteFromStorage(datasetFile.filePath)

    // Delete the dataset file record
    await prisma.datasetFile.delete({
      where: { id: fileId }
    })

    return NextResponse.json({ message: 'Dataset file deleted successfully' })
  } catch (error) {
    console.error('Error deleting dataset file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}