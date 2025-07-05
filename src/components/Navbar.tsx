'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { UserMenu } from './UserMenu'
import { useCart } from '@/contexts/CartContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const pathname = usePathname()
  const { cartCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <nav className={`nav-enhanced sticky top-0 z-50 transition-all duration-300 ${
      hasScrolled ? 'shadow-md' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover-scale group"
            onClick={() => setIsOpen(false)}
          >
            <div className="text-2xl font-bold text-gradient group-hover:opacity-90 transition-opacity">
              <span className="animate-float inline-block">🪁</span> Balaji Kite House
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`relative text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium group ${
                isActive('/') ? 'text-primary-600' : ''
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-100 transition-transform origin-left"></span>
              )}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-0 transition-transform origin-left group-hover:scale-x-100"></span>
            </Link>
            <Link 
              href="/products" 
              className={`relative text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium group ${
                isActive('/products') ? 'text-primary-600' : ''
              }`}
            >
              Products
              {isActive('/products') && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-100 transition-transform origin-left"></span>
              )}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-0 transition-transform origin-left group-hover:scale-x-100"></span>
            </Link>
            <Link 
              href="/cart" 
              className={`flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium bg-gray-50 px-4 py-2 rounded-lg hover:bg-blue-50 group relative ${
                isActive('/cart') ? 'text-primary-600 bg-blue-50' : ''
              }`}
            >
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 transition-all duration-200 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="w-6 h-6 relative">
                <div className={`transform transition-all duration-300 ${
                  isOpen ? 'rotate-45 translate-y-2.5' : ''
                } w-full h-0.5 bg-current absolute top-0`}></div>
                <div className={`transition-opacity duration-300 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                } w-full h-0.5 bg-current absolute top-2.5`}></div>
                <div className={`transform transition-all duration-300 ${
                  isOpen ? '-rotate-45 -translate-y-2.5' : ''
                } w-full h-0.5 bg-current absolute bottom-0`}></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-6 bg-white border-t shadow-lg rounded-b-lg">
            <div className="flex justify-center border-b pb-4">
              <UserMenu />
            </div>
            <div className="space-y-2">
              <Link
                href="/"
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/') 
                  ? 'text-primary-600 bg-blue-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span>Home</span>
              </Link>
              <Link
                href="/products"
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/products') 
                  ? 'text-primary-600 bg-blue-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span>Products</span>
              </Link>
              <Link
                href="/cart"
                className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 relative ${
                  isActive('/cart') 
                  ? 'text-primary-600 bg-blue-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span>Cart</span>
                <div className="relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
