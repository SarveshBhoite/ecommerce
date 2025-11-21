export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return Response.json({ message: "Email and password are required" }, { status: 400 })
  }

  // Mock login - in production, verify against database
  const userId = Math.random().toString(36).substr(2, 9)
  const token = `jwt_${userId}_${Date.now()}`

  return Response.json({
    token,
    userId,
    message: "Login successful",
  })
}
