// This is a client-side utility for storing cart data
export const getCart = (): { [key: string]: number } => {
  if (typeof window === "undefined") return {}
  const cart = localStorage.getItem("cart")
  return cart ? JSON.parse(cart) : {}
}

export const setCart = (cart: { [key: string]: number }) => {
  if (typeof window === "undefined") return
  localStorage.setItem("cart", JSON.stringify(cart))
}

export const addToCart = (productId: string, quantity = 1) => {
  const cart = getCart()
  cart[productId] = (cart[productId] || 0) + quantity
  setCart(cart)
}

export const removeFromCart = (productId: string) => {
  const cart = getCart()
  delete cart[productId]
  setCart(cart)
}

export const updateCartQuantity = (productId: string, quantity: number) => {
  const cart = getCart()
  if (quantity <= 0) {
    delete cart[productId]
  } else {
    cart[productId] = quantity
  }
  setCart(cart)
}
