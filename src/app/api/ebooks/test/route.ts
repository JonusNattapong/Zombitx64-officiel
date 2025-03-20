import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EbookCategory, EbookLanguage } from '@/types/ebook'

export async function GET() {
  try {
    // Create a test ebook
    const testEbook = await prisma.ebook.create({
      data: {
        title: 'Test E-book',
        description: 'This is a test e-book',
        category: 'Programming',
        tags: '["test", "programming"]',
        language: 'English',
        author: 'Test Author',
        visibility: 'PUBLIC',
        licenseType: 'FREE',
        userId: 'test-user-id', // This will fail if the user doesn't exist
        tableOfContents: JSON.stringify({
          chapter1: 'Introduction',
          chapter2: 'Getting Started'
        })
      }
    })

    // Retrieve the created ebook
    const retrievedEbook = await prisma.ebook.findUnique({
      where: { id: testEbook.id },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Clean up
    await prisma.ebook.delete({
      where: { id: testEbook.id }
    })

    return NextResponse.json({
      message: 'E-book API test successful',
      created: testEbook,
      retrieved: retrievedEbook
    })
  } catch (error: any) {
    console.error('E-book API test failed:', error)
    return NextResponse.json({
      error: 'E-book API test failed',
      details: error.message
    }, { status: 500 })
  }
}