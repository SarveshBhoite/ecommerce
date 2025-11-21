import { NextResponse } from "next/server";
import Product from "@/lib/models/Product";
import { dbConnect } from "@/lib/dbconnect";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();

    const formatted = products.map((p) => ({
      ...p,
      id: String(p._id),

      _id: undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Product Fetch Error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}
