import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { generateQRCode } from "@/lib/payment";
import type { Prisma } from "@prisma/client";

// Define transaction status constants
const TransactionStatus = {
  PENDING: 'pending',
  QR_GENERATED: 'qr_generated',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Type for QR code metadata
interface QRCodeMetadata {
  qrCode: string;
  expiresAt: string;
}

// Type for API responses
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Type for transaction details in response
interface TransactionDetails {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  currency: string | null;
  metadata: string | null;
  updatedAt: Date;
}

const transactionSelect = {
  id: true,
  amount: true,
  status: true,
  paymentMethod: true,
  currency: true,
  metadata: true,
  updatedAt: true,
} as const;

type TransactionWithMetadata = Prisma.TransactionGetPayload<{
  select: typeof transactionSelect;
}>;

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

 // Get owner's payment settings with proper type selection
 // Get owner's payment settings using raw query
 const [settings] = await prisma.$queryRaw<Array<{ promptpayId: string | null }>>`
   SELECT promptpayId FROM UserSettings WHERE userId = ${product.ownerId}
 `;

 if (!settings?.promptpayId) {
   return NextResponse.json(
     { error: "Owner's PromptPay ID not found" },
     { status: 404 }
   );
 }

 // Generate QR code for PromptPay payment
 const qrCode = await generateQRCode({
   amount: product.price,
   paymentId: transaction.id,
   promptpayId: settings.promptpayId,
 });

 // Store QR code data in metadata
 const qrCodeData = {
   qrCode,
   expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
 };

 // Store QR code data and update transaction status
 await prisma.$executeRaw`
   UPDATE Transaction
   SET status = 'qr_generated',
       reference = ${JSON.stringify({
         qrCode,
         expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
       })}
   WHERE id = ${transaction.id}
 `;

 // Get updated transaction data
 const [updatedTransaction] = await prisma.$queryRaw<Array<{
   id: string;
   amount: number;
   status: string;
   paymentMethod: string;
   currency: string | null;
   updatedAt: Date;
   reference: string | null;
 }>>`
   SELECT id, amount, status, paymentMethod, currency, updatedAt, reference
   FROM Transaction
   WHERE id = ${transaction.id}
 `;

 if (!updatedTransaction) {
   throw new Error("Failed to fetch updated transaction");
 }

 if (!updatedTransaction) {
   throw new Error("Failed to fetch updated transaction");
 }

 // Try to parse QR code data from reference field
 let qrData = null;
 let expiresAt = null;

 if (updatedTransaction.reference) {
   try {
     const parsed = JSON.parse(updatedTransaction.reference);
     qrData = parsed.qrCode;
     expiresAt = parsed.expiresAt ? new Date(parsed.expiresAt) : null;
   } catch (e) {
     console.error('Failed to parse transaction reference:', e);
   }
 }

 // Create notification for seller
 await prisma.notification.create({
   data: {
     userId: product.ownerId,
     type: "new_purchase",
     title: "New Purchase",
     content: `Someone has initiated a purchase for ${product.title}`,
     data: JSON.stringify({
       productId: product.id,
       transactionId: transaction.id,
       qrCode: qrData,
       expiresAt: expiresAt?.toISOString()
     })
   }
 });

 return NextResponse.json({
   success: true,
   data: {
     id: updatedTransaction.id,
     amount: updatedTransaction.amount,
     status: updatedTransaction.status,
     paymentMethod: updatedTransaction.paymentMethod,
     currency: updatedTransaction.currency,
     updatedAt: new Date(updatedTransaction.updatedAt),
     qrCode: qrData,
     expiresAt
   }
 });
} catch (error) {
 console.error("Purchase error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process purchase";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: "PURCHASE_ERROR"
      },
      { status: 500 }
    );
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

    // Get transaction data using raw query
    const [transaction] = await prisma.$queryRaw<Array<{
      id: string;
      amount: number;
      status: string;
      paymentMethod: string;
      currency: string | null;
      updatedAt: Date;
      reference: string | null;
    }>>`
      SELECT id, amount, status, paymentMethod, currency, updatedAt, reference
      FROM Transaction
      WHERE id = ${transactionId}
    `;

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction not found",
          code: "TRANSACTION_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // Try to parse QR code data from reference field
    let qrData = null;
    let expiresAt = null;

    if (transaction.reference) {
      try {
        const parsed = JSON.parse(transaction.reference);
        qrData = parsed.qrCode;
        expiresAt = parsed.expiresAt ? new Date(parsed.expiresAt) : null;
      } catch (e) {
        console.error('Failed to parse transaction reference:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        currency: transaction.currency,
        updatedAt: new Date(transaction.updatedAt),
        qrCode: qrData,
        expiresAt
      }
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to check payment status";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: "STATUS_CHECK_ERROR"
      },
      { status: 500 }
    );
  }
}
