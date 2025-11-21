export async function POST(request: Request) {
  const orderData = await request.json()

  // Mock order creation - in production, save to database
  const orderId = Math.random().toString(36).substr(2, 9)

  return Response.json({
    orderId,
    ...orderData,
    status: "confirmed",
    message: "Order created successfully",
  })
}
