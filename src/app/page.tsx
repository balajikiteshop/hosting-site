import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import AddToCartButton from '@/components/AddToCartButton'
import SafeImage from '@/components/SafeImage'
import { formatPrice } from '@/lib/utils'
import { Mail, Phone, MapPin } from 'lucide-react'
import type { Product } from '@/types/product'

// Disable caching for this page to show real-time product updates
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    // Get latest active products with explicit field selection for security
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
  } catch (error) {
    console.error('Error fetching featured products:', error)
    // Return empty array on error to prevent app crash
    return []
  }
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
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-48">
                    {product.imageUrl ? (
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        fallbackClassName="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-gray-400"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-gray-400">
                        <div className="text-3xl mb-1 animate-float">🪁</div>
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
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

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions about our products or need assistance? We're here to help! 
              Contact us through any of the following methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Email */}
            {gmail && (
              <div className="text-center bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                <p className="text-gray-600 mb-4">Send us an email anytime</p>
                <a 
                  href={`mailto:${gmail}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {gmail}
                </a>
              </div>
            )}

            {/* Phone */}
            {phone && (
              <div className="text-center bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">Mon-Sat 9AM-7PM</p>
                <a 
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  {phone}
                </a>
              </div>
            )}

            {/* Address */}
            {address && (
              <div className="text-center bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                <p className="text-gray-600 mb-4">Come to our store</p>
                <address className="text-red-600 not-italic font-medium">
                  {address}
                </address>
              </div>
            )}
          </div>

          {/* Additional Contact Info or CTA */}
          <div className="text-center mt-12">
            <div className="bg-blue-600 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Ready to Fly High?</h3>
              <p className="text-blue-100 mb-6">
                Discover our premium collection of kites and accessories. 
                Perfect for festivals, competitions, or just having fun!
              </p>
              <Link 
                href="/products"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Shop Our Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
