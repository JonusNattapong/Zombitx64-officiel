import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { ethers } from "ethers";

const SMART_CONTRACT_ADDRESS = process.env.SMART_CONTRACT_ADDRESS;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const transactionId = params.id;

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "ไม่พบ Transaction" }, { status: 404 });
    }

    // ตรวจสอบสิทธิ์ในการเข้าถึง Transaction
    if (
      (transaction as any).buyerId !== session.user.id &&
      (transaction as any).sellerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์เข้าถึง Transaction นี้" },
        { status: 403 }
      );
    }

    // ตรวจสอบสถานะ Transaction จาก Blockchain
    if ((transaction as any).transactionHash) {
      if (!SMART_CONTRACT_ADDRESS) {
        throw new Error("SMART_CONTRACT_ADDRESS is not defined");
      }
      const provider = new ethers.Providers.JsonRpcProvider(
        process.env.BLOCKCHAIN_RPC_URL
      );
      const contract = new ethers.Contract(
        SMART_CONTRACT_ADDRESS,
        [
          "event PurchaseCompleted(uint256 productId, address buyer, address seller, uint256 amount)",
        ],
        provider
      );

      const filter = contract.filters.PurchaseCompleted(
        (transaction as any).productId,
        (transaction as any).buyerId,
        (transaction as any).sellerId,
        null
      );
      const events = await contract.queryFilter(filter, -100, "latest");

      if (events.length > 0) {
        // อัพเดทสถานะ Transaction เป็น COMPLETED
        await db.transaction.update({
          where: { id: transactionId },
          data: { status: "completed" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: (transaction as any).id,
        buyerId: (transaction as any).buyerId,
        sellerId: (transaction as any).sellerId,
        productId: (transaction as any).productId,
        transactionHash: (transaction as any).transactionHash,
        status: (transaction as any).status,
        buyer: {
          id: (transaction as any).buyer?.id,
          name: (transaction as any).buyer?.name,
          image: (transaction as any).buyer?.image,
        },
        seller: {
          id: (transaction as any).seller?.id,
          name: (transaction as any).seller?.name,
          image: (transaction as any).seller?.image,
        },
        product: {
          id: (transaction as any).product?.id,
          title: (transaction as any).product?.title,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล Transaction" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const transactionId = params.id;
    const { status } = await req.json();

    if (!transactionId || !status) {
      return NextResponse.json({
        error: "Transaction ID และ Status เป็นสิ่งจำเป็น",
      }, { status: 400 });
    }

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    } as any);

    if (!transaction) {
      return NextResponse.json({ error: "ไม่พบ Transaction" }, { status: 404 });
    }

    // ตรวจสอบสิทธิ์ในการแก้ไข Transaction
    if (transaction.sellerId !== session.user.id) {
      return NextResponse.json({
        error: "คุณไม่มีสิทธิ์แก้ไข Transaction นี้",
      }, { status: 403 });
    }

    // ตรวจสอบสถานะที่อนุญาตให้แก้ไขได้
    if (transaction.status !== "pending") {
      return NextResponse.json({
        error: "Transaction นี้ไม่สามารถแก้ไขได้",
      }, { status: 400 });
    }

    // อัพเดท Transaction
    const updatedTransaction = await db.transaction.update({
      where: { id: transactionId },
      data: { status: status },
    } as any); // Temporary type assertion

    // สร้าง notification สำหรับผู้ซื้อ
    await db.notification.create({
      data: {
        userId: transaction.buyerId,
        message: `Transaction ${transaction.product?.title} has been updated to ${status}`,
        type: "TRANSACTION_UPDATE",
        metadata: JSON.stringify({
          transactionId: transaction.id,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
    });
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพเดท Transaction" },
      { status: 500 }
    );
  }
}
