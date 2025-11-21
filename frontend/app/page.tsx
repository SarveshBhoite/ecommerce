"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { ProductGrid } from "@/components/product-grid"
import { useAuth } from "@/lib/store"
import { Sparkles, Search } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const isAuthenticated = useAuth((state) => state.isAuthenticated())

  const itemsPerPage = 6

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, products])

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={24} className="text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Explore Collections</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-balance">Premium Products</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover our carefully curated collection of quality items handpicked just for you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder-muted-foreground border-2 border-transparent focus:border-primary focus:outline-none transition-all duration-200 text-base"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105"
                  : "bg-secondary text-foreground hover:bg-muted hover:shadow-md"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground font-medium">Loading premium products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles size={48} className="mx-auto text-muted-foreground mb-4 opacity-30" />
            <p className="text-muted-foreground text-lg mb-2">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <ProductGrid products={paginatedProducts} isAuthenticated={isAuthenticated} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-secondary disabled:opacity-50 hover:bg-muted transition-all duration-200 hover:scale-105 disabled:scale-100 font-medium"
                >
                  ← Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                        currentPage === page
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-110"
                          : "bg-secondary hover:bg-muted hover:scale-105"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-secondary disabled:opacity-50 hover:bg-muted transition-all duration-200 hover:scale-105 disabled:scale-100 font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
