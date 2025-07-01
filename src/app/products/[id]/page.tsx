import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  })
  return product
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 animate-fadeIn">
        <Link href="/products" className="btn-secondary inline-flex items-center space-x-2 hover-lift">
          <span>←</span>
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="animate-slideIn">
          <div className="aspect-square image-placeholder rounded-lg overflow-hidden card-enhanced">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover hover-scale"
              />
            ) : (
              <div className="text-9xl animate-float">🪁</div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="animate-fadeIn">
          <div className="status-badge-enhanced status-confirmed-enhanced mb-4">
            {product.category?.name || 'Uncategorized'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold heading-gradient mb-4 text-shadow">
            {product.name}
          </h1>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-8 card-enhanced p-6 kite-shadow">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ₹{product.price}
            </div>
            <div className="text-sm">
              {product.stock > 0 ? (
                <span className="status-badge-enhanced status-delivered-enhanced">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="status-badge-enhanced text-red-600 bg-red-50 border-red-200">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Section */}
          {product.stock > 0 && (
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="quantity" className="form-label">
                  Quantity:
                </label>
                <select
                  id="quantity"
                  className="form-select max-w-24"
                  defaultValue="1"
                >
                  {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.imageUrl,
                    stock: product.stock
                  }}
                  className="flex-1"
                />
                <Link 
                  href="/checkout"
                  className="btn-success text-center py-3 px-6 hover-lift"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          )}

          {/* Product Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 card-enhanced p-4 hover-lift">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">Premium quality materials</span>
              </div>
              <div className="flex items-center space-x-3 card-enhanced p-4 hover-lift">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">Hand-crafted with precision</span>
              </div>
              <div className="flex items-center space-x-3 card-enhanced p-4 hover-lift">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">Durable and long-lasting</span>
              </div>
              <div className="flex items-center space-x-3 card-enhanced p-4 hover-lift">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">Perfect for all skill levels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
