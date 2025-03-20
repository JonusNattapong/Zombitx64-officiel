import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";
import { z } from "zod";

// Validate request body for adding items to cart
const addToCartSchema = z.object({
  productId: z.string().uuid(),
  productType: z.string(),
  quantity: z.number().default(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await req.json();
    const validatedData = addToCartSchema.parse(data);

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return new NextResponse(
        JSON.stringify({ error: "Product not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if product is available
    if (product.status !== "ACTIVE") {
      return new NextResponse(
        JSON.stringify({ error: "Product is not available" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the cart exists for this user, if not create one
    let cart = await db.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Check if item is already in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validatedData.productId,
      },
    });

    if (existingItem) {
      // Update quantity if item already exists
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + validatedData.quantity,
        },
      });
    } else {
      // Add new item to cart
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          price: product.price,
        },
      });
    }

    return new NextResponse(
      JSON.stringify({ success: true, message: "Item added to cart" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error adding to cart:", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid data format", details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ error: "Failed to add item to cart" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get the user's cart with items
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                productType: true,
                dataset: {
                  select: {
                    coverImage: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return new NextResponse(
        JSON.stringify({ items: [], totalItems: 0, totalAmount: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return new NextResponse(
      JSON.stringify({
        items: cart.items,
        totalItems,
        totalAmount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error fetching cart:", error);
    
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch cart" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
