// app/api/products/[id]/route.ts

const products = [
  {
    id: "1",
    name: "Minimalist Backpack",
    description: "Premium lightweight backpack perfect for daily use",
    price: 89.99,
    image_url: "/classicwatch.jpg?height=400&width=400",
    category: "accessories",
  },
  {
    id: "2",
    name: "Classic Watch",
    description: "Elegant timepiece with leather strap",
    price: 149.99,
    image_url: "/classicwatch.jpg?height=400&width=400",
    category: "accessories",
  },
  {
    id: "3",
    name: "Cotton T-Shirt",
    description: "Comfortable everyday t-shirt in neutral colors",
    price: 29.99,
    image_url: "/classicwatch.jpg?height=400&width=400",
    category: "clothing",
  },
  {
    id: "4",
    name: "Denim Jeans",
    description: "Timeless blue denim with perfect fit",
    price: 79.99,
    image_url: "/classicwatch.jpg?height=400&width=400",
    category: "clothing",
  },
  {
    id: "5",
    name: "Wireless Earbuds",
    description: "High-quality sound with noise cancellation",
    price: 129.99,
    image_url: "/classicwatch.jpg?height=400&width=400",
    category: "electronics",
  },
  {
    id: "6",
    name: "Sunglasses",
    description: "UV protection with stylish frame",
    price: 99.99,
    image_url: "/classicwatch.jpg?height=400&width=400",
    category: "accessories",
  },
  {
    id: "7",
    name: "Sneakers",
    description: "Comfortable walking shoes with cushioning",
    price: 119.99,
    image_url: "/classicwatch.jpg?height=400&width=400",
    category: "clothing",
  },
  {
    id: "8",
    name: "Phone Case",
    description: "Protective case with minimalist design",
    price: 24.99,
    image_url: "/classicwatch.jpg?height=400&width=400",
    category: "electronics",
  },
]

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params

  const product = products.find((p) => p.id === id)

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 })
  }

  return Response.json(product)
}
