import { NextResponse } from "next/server";
import Product from "@/lib/models/Product";
import { dbConnect } from "@/lib/dbconnect";

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const product: any = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      id: String(product._id),
      _id: undefined,
    });
  } catch (error) {
    console.error("Single Product Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
