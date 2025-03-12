import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { generateQRCode } from "@/lib/payment";
import { Prisma } from "@prisma/client";

const transactionSelect = {
    id: true,
    buyerId: true,
    sellerId: true,
    productId: true,
    amount: true,
    buyerFee: true,
    sellerFee: true,
    totalAmount: true,
    status: true,
    paymentMethod: true,
    transactionHash: true,
    reference: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.TransactionSelect

type TransactionSelect = Prisma.TransactionGetPayload<{ select: typeof transactionSelect }>;

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { productId } = data;

    // Get product details
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user already owns the product
    const existingTransaction = await db.transaction.findFirst({
      where: {
        productId,
        buyerId: session.user.id,
        status: {
          in: ["completed", "pending"]
        }
      },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "You already own or are purchasing this product" },
        { status: 400 }
      );
    }

    // Create pending transaction
    const transaction = await db.transaction.create({
      data: {
        buyerId: session.user.id,
        sellerId: product.ownerId,
        productId: product.id,
        amount: product.price,
        buyerFee: 0,
        sellerFee: 0,
        totalAmount: product.price,
        status: "pending",
        paymentMethod: "bank_transfer",
      },
      ...transactionSelect
    });

    // Get owner's payment settings
    const settings = await db.userSettings.findUnique({
      where: { userId: product.ownerId },
      select: { promptpayId: true },
    });

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

    // Store QR code data in reference field
    await db.transaction.update({
      where: { id: transaction.id },
      data: {
        reference: JSON.stringify({
          qrCode: qrCode,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Expires in 1 hour
        }),
      },
    });

    // Create notification for seller
    await db.notification.create({
      data: {
        userId: product.ownerId,
        message: `Someone has initiated a purchase for ${product.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error("Purchase error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process purchase";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: "PURCHASE_ERROR",
      },
      { status: 500 }
    );
  }
}

// Check payment status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

        // Get transaction by ID
        const transaction = await db.transaction.findUnique({
            where: { id: transactionId },
            select: transactionSelect
        });

        if (!transaction) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Transaction not found",
                    code: "TRANSACTION_NOT_FOUND",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        console.error("Payment status check error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Failed to check payment status";
        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                code: "STATUS_CHECK_ERROR",
            },
            { status: 500 }
        );
    }
}
