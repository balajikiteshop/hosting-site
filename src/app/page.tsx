import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    take: 6,
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })
  return products
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-enhanced text-white relative">
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="text-center animate-fadeIn">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-shadow">
              🪁 Balaji Kite House
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-95">
              Discover premium kites, accessories, and supplies for enthusiasts of all ages. 
              Quality craftsmanship that soars above the rest.
            </p>
            <div className="space-x-4">
              <Link
                href="/products"
                className="btn-primary inline-block text-center hover-lift"
              >
                Shop Now
              </Link>
              <Link
                href="#about"
                className="btn-secondary inline-block text-center hover-lift"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-4 text-shadow">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Explore our premium collection of kites and accessories
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="product-card-enhanced animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="product-image-enhanced">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl relative z-10 animate-float">🪁</div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="status-badge-enhanced status-confirmed-enhanced mb-3">{product.category.name}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
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
                      <button className="btn-success px-4 hover-lift">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fadeIn">
              <div className="text-6xl mb-4 animate-float">🪁</div>
              <p className="text-lg text-gray-600 mb-4">No products available yet.</p>
              <Link
                href="/admin"
                className="btn-primary hover-lift"
              >
                Add Products (Admin)
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slideIn">
              <h2 className="text-3xl md:text-4xl font-bold heading-gradient mb-6 text-shadow">
                About Balaji Kite House
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                With over decades of experience in crafting premium kites, Balaji Kite House 
                has been the trusted name for kite enthusiasts across the region. Our commitment 
                to quality and tradition ensures every kite soars with excellence.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3 card-enhanced p-4 hover-lift">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Premium Quality</h3>
                    <p className="text-gray-600">Hand-crafted with finest materials</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 card-enhanced p-4 hover-lift">
                  <div className="text-2xl">🚚</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
                    <p className="text-gray-600">Quick and secure shipping</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 card-enhanced p-4 hover-lift">
                  <div className="text-2xl">💳</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure Payments</h3>
                    <p className="text-gray-600">Safe transactions with Razorpay</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 card-enhanced p-4 hover-lift">
                  <div className="text-2xl">🎨</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Custom Designs</h3>
                    <p className="text-gray-600">Personalized kite designs available</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center animate-fadeIn">
              <div className="text-9xl mb-4 animate-float">🪁</div>
              <p className="text-lg text-gray-600">
                Experience the joy of flying with our premium kites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gradient">🪁 Balaji Kite House</h3>
              <p className="text-gray-400">
                Premium kites and accessories for enthusiasts of all ages.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/products" className="block text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Products
                </Link>
                <Link href="/cart" className="block text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Cart
                </Link>
                <Link href="/admin" className="block text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Admin
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>info@balajikitehouse.com</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+91 12345 67890</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Your Address Here</span>
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Balaji Kite House. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
