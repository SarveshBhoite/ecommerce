import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import Product from "@/lib/models/Product";

export async function GET() {
  try {
    await dbConnect();

    const products = [
      {
        name: "Minimalist Backpack",
        description: "Premium lightweight backpack perfect for daily use",
        price: 89.99,
        image_url: "/backpack.jpg?height=400&width=400",
        category: "accessories",
      },
      {
        name: "Classic Watch",
        description: "Elegant timepiece with leather strap",
        price: 149.99,
        image_url: "/classicwatch.jpg?height=400&width=400",
        category: "accessories",
      },
      {
        name: "Cotton T-Shirt",
        description: "Comfortable everyday t-shirt in neutral colors",
        price: 29.99,
        image_url: "/tshirt.jpg?height=400&width=400",
        category: "clothing",
      },
      {
        name: "Denim Jeans",
        description: "Timeless blue denim with perfect fit",
        price: 79.99,
        image_url: "/jeans.jpg?height=400&width=400",
        category: "clothing",
      },
      {
        name: "Wireless Earbuds",
        description: "High-quality sound with noise cancellation",
        price: 129.99,
        image_url: "/earbuds.jpg?height=400&width=400",
        category: "electronics",
      },
      {
        name: "Sunglasses",
        description: "UV protection with stylish frame",
        price: 99.99,
        image_url: "/sunglasses.jpg?height=400&width=400",
        category: "accessories",
      },
      {
        name: "Sneakers",
        description: "Comfortable walking shoes with cushioning",
        price: 119.99,
        image_url: "/sneakers.jpg?height=400&width=400",
        category: "clothing",
      },
      {
        name: "Phone Case",
        description: "Protective case with minimalist design",
        price: 24.99,
        image_url: "/phonecase.jpg?height=400&width=400",
        category: "electronics",
      },
    ];

    // Optional: Clear old products for clean fresh seeding
    await Product.deleteMany({});

    // Insert new ones
    await Product.insertMany(products);

    return NextResponse.json({
      success: true,
      message: "Products seeded successfully!",
    });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
