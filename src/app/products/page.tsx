import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import AddToCartButton from '@/components/AddToCartButton'

async function getProducts() {
  const rawProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      imageUrl: true,
      categoryId: true,
      isActive: true,
      category: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
        select: {
          id: true,
          sku: true,
          name: true,
          price: true,
          stock: true,
          imageUrl: true,
          attributes: true,
          isActive: true,
          productId: true
        }
      }
    }
  })

  // Convert the raw products to match our Product type
  return rawProducts.map(p => ({
    ...p,
    variants: p.variants.map(v => ({
      ...v,
      attributes: v.attributes as Record<string, string | undefined>
    }))
  }))
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
  return categories
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-bold heading-gradient mb-4 text-shadow">
          Our Products
        </h1>
        <p className="text-lg text-gray-600">
          Discover our complete collection of premium kites and accessories
        </p>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="mb-8 animate-slideIn">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="btn-primary"
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="btn-secondary hover-lift"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="product-card-enhanced animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="product-image-enhanced">
                {product.imageUrl ? (
                  <div className="relative h-48">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-6xl relative z-10 animate-float">🪁</div>
                )}
              </div>
              <div className="p-6">
                <div className="status-badge-enhanced status-confirmed-enhanced mb-3">
                  {product.category?.name || 'Uncategorized'}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  {product.variants.length > 0 ? (
                    <span className="text-2xl font-bold text-blue-600">
                      From ₹{Math.min(
                        product.price,
                        ...product.variants.map(v => v.price)
                      )}
                    </span>
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{product.price}
                    </span>
                  )}
                  <span className="status-badge-enhanced status-pending-enhanced">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="btn-primary flex-1 text-center hover-lift"
                  >
                    View Details
                  </Link>
                  <AddToCartButton 
                    product={product}
                    quantity={1}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 animate-fadeIn">
          <div className="text-6xl mb-4 animate-float">🪁</div>
          <p className="text-lg text-gray-600 mb-4">No products available yet.</p>
        </div>
      )}
    </div>
  )
}
