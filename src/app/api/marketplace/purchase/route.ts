import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { generateQRCode } from "@/lib/payment"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { productId } = data

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
 
     if (!product) {
       return NextResponse.json({ error: 'Product not found' }, { status: 404 });
     }

    // Check if user already owns the product
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        productId,
        buyerId: session.user.id,
        status: "completed"
      }
    })

    if (existingTransaction) {
      return NextResponse.json(
        { error: "You already own this product" },
        { status: 400 }
      )
    }

 // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        buyerId: session.user.id,
        sellerId: product.ownerId,
        productId: product.id,
        amount: product.price,
        status: 'pending',
        paymentMethod: 'qr_promptpay',
        currency: 'THB',
      },
    });

 // Get owner's payment settings
 const owner = await prisma.user.findUnique({
   where: { id: product.ownerId },
   include: { settings: true }, // Correctly include the settings relation
 });

 if (!owner?.settings?.promptpayId) {
   return NextResponse.json(
     { error: "Owner's PromptPay ID not found" }, // Improved error message
     { status: 404 }
   );
 }

 // Generate QR code for PromptPay payment
 const qrCode = await generateQRCode({
   amount: product.price,
   paymentId: transaction.id,
   promptpayId: owner.settings.promptpayId,
 });

  // Update transaction with QR code data and status
 const updatedTransaction = await prisma.transaction.update({
   where: { id: transaction.id },
   data: {
     qrCodeData: qrCode,
     qrCodeExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
     status: 'qr_generated', // Update status
   },
 });


 // Create notification for seller
 await prisma.notification.create({
      data: {
        userId: product.ownerId,
        type: "new_purchase",
        title: "New Purchase",
        content: `Someone has initiated a purchase for ${product.title}`,
        data: JSON.stringify({
          productId: product.id,
          transactionId: transaction.id
        })
      }
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        qrCode: qrCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    )
  }
}

// Check payment status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const transactionId = searchParams.get("transactionId")

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: transaction.status,
      updatedAt: transaction.updatedAt
    })
  } catch (error) {
    console.error("Payment status check error:", error)
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    )
  }
}
