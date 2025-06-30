'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string | null
    stock: number
  }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now, we'll use localStorage for cart functionality
    // In a real app, you'd want to use a proper cart system with user sessions
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
    setLoading(false)
  }, [])

  const updateCartInLocalStorage = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items))
    setCartItems(items)
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    updateCartInLocalStorage(updatedItems)
  }

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId)
    updateCartInLocalStorage(updatedItems)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="spinner-large mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 animate-fadeIn">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-6 animate-float" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="mt-2 text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link
            href="/products"
            className="btn-primary hover-lift"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold heading-gradient mb-8 text-shadow animate-fadeIn">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div 
                key={item.id} 
                className="card-enhanced p-6 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-2xl">🪁</div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">{item.product.name}</h3>
                    <p className="text-gray-600">₹{item.product.price} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-lg font-bold text-blue-600">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors hover-scale"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card-enhanced p-6 sticky top-4 animate-slideIn">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items ({getTotalItems()})</span>
                <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-blue-600">₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <button className="btn-primary w-full mb-3 hover-lift">
                Proceed to Checkout
              </button>
            </Link>
            
            <Link
              href="/products"
              className="btn-secondary w-full text-center block hover-lift"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
