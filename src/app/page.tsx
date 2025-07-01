import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import AddToCartButton from '@/components/AddToCartButton'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

async function getFeaturedProducts(): Promise<Product[]> {
  // Get latest active products
  const rawProducts = await prisma.product.findMany({
    take: 4,
    where: { 
      isActive: true 
    },
    orderBy: { 
      createdAt: 'desc' 
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      stock: true,
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

export default async function Home() {
  const products = await getFeaturedProducts()

  const gmail = process.env.GMAIL || "";
  const phone = process.env.PHONE || "";
  const address = process.env.ADDRESS || "";
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Balaji Kite House
            </h1>
            <p className="text-lg mb-8">
              Discover our amazing selection of kites, threads, and accessories.
            </p>
            <Link 
              href="/products" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-48">
                    <Image
                      src={product.imageUrl || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Show base price or variant price range */}
                  <div className="mb-4">
                    {product.variants.length > 0 ? (
                      <div className="text-gray-900">
                        From {formatPrice(Math.min(
                          product.price,
                          ...product.variants.map(v => v.price)
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <AddToCartButton
                    product={product}
                    quantity={1}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
