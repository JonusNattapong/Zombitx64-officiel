import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import Omise from 'omise';

const omise = new Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, cardName, cardNumber, cardExpiry, cardCvc, amount } = await req.json();

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!productId || !cardName || !cardNumber || !cardExpiry || !cardCvc || !amount) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // สร้าง Token จากข้อมูลบัตรเครดิต
    const token = await omise.tokens.create({
      card: {
        name: cardName,
        number: cardNumber,
        expiration_month: cardExpiry.substring(0, 2),
        expiration_year: cardExpiry.substring(3, 5),
        security_code: cardCvc,
      },
    });

    if (token.error) {
      return NextResponse.json({ error: token.error.message }, { status: 400 });
    }

    // สร้าง Charge
    const charge = await omise.charges.create({
      amount: amount * 100, // แปลงเป็นสตางค์
      currency: "thb",
      card: token.id,
    });

    if (charge.error) {
      return NextResponse.json({ error: charge.error.message }, { status: 400 });
    }

    // อัพเดท transaction ในฐานข้อมูล
    const transaction = await db.transaction.update({
      where: { id: productId }, // ต้องเปลี่ยนเป็น transaction ID จริง
      data: {
        status: charge.status === "successful" ? "completed" : "failed",
        paymentMethod: "credit_card",
        metadata: JSON.stringify(charge),
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error("Omise checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
