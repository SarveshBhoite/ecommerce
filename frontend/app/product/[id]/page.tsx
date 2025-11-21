"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/lib/store"
import { addToCart } from "@/lib/db"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
}

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const isAuthenticated = useAuth((state) => state.isAuthenticated())
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error("Failed to fetch product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToastMessage("Please log in first")
      setTimeout(() => router.push("/login"), 500)
      return
    }

    if (product) {
      addToCart(product.id)
      showToastMessage(`Added ${product.name} to cart`)
    }
  }

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-secondary rounded-xl overflow-hidden h-96 md:h-full flex items-center justify-center">
            <img
              src={product.image_url || "/classicwatch.jpg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </span>
              <h1 className="text-4xl font-bold mt-4 mb-4">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-6">{product.description}</p>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Price</p>
                  <p className="text-5xl font-bold text-primary">${product.price}</p>
                </div>

                <button onClick={handleAddToCart} className="w-full btn-primary py-4 text-lg rounded-lg font-semibold">
                  Add to Cart
                </button>

                <button
                  onClick={() => router.back()}
                  className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}
    </main>
  )
}
