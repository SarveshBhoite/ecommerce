// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";
import { getUserIdFromRequest } from "@/lib/getUser"; // make sure this is present

type Req = Request;

export async function GET(req: Req) {
  try {
    await dbConnect();

    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const cart: any = await Cart.findOne({ userId }).lean();

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Attach product details to each item
    const detailedItems = await Promise.all(
      cart.items.map(async (it: any) => {
        const product: any = await Product.findById(it.productId).lean();
        return {
          productId: it.productId,
          quantity: it.quantity,
          product: product
            ? { ...product, id: String(product._id), _id: undefined }
            : null,
        };
      })
    );

    return NextResponse.json({ items: detailedItems });
  } catch (error: any) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Req) {
  try {
    await dbConnect();

    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { productId } = body;
    if (!productId) return NextResponse.json({ message: "productId required" }, { status: 400 });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, items: [{ productId, quantity: 1 }] });
    } else {
      const existing = cart.items.find((i: any) => i.productId === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
      await cart.save();
    }

    return NextResponse.json({ message: "Added to cart" });
  } catch (error: any) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Req) {
  try {
    await dbConnect();

    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { productId, quantity } = await req.json();
    if (!productId || typeof quantity !== "number") {
      return NextResponse.json({ message: "productId and numeric quantity required" }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return NextResponse.json({ message: "Cart not found" }, { status: 404 });

    const item = cart.items.find((i: any) => i.productId === productId);
    if (!item) return NextResponse.json({ message: "Item not found" }, { status: 404 });

    item.quantity = quantity;
    // remove item if quantity <= 0
    cart.items = cart.items.filter((i: any) => i.quantity > 0);

    await cart.save();

    return NextResponse.json({ message: "Quantity updated" });
  } catch (error: any) {
    console.error("PUT /api/cart error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Req) {
  try {
    await dbConnect();

    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ message: "productId required" }, { status: 400 });

    const cart = await Cart.findOne({ userId });
    if (!cart) return NextResponse.json({ message: "Cart not found" }, { status: 404 });

    cart.items = cart.items.filter((i: any) => i.productId !== productId);
    await cart.save();

    return NextResponse.json({ message: "Item removed" });
  } catch (error: any) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ message: "Server error", error: String(error) }, { status: 500 });
  }
}
