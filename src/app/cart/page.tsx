'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Cart } from '@/types/product'

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch cart')
      }
      const data = await res.json()
      setCart(data)
    } catch (err: any) {
      console.error('Error fetching cart:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (updating || newQuantity < 1) return
    setUpdating(itemId)

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update quantity')
      }

      await fetchCart() // Refresh cart data
      router.refresh() // Update cart count in header

    } catch (err: any) {
      console.error('Error updating quantity:', err)
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    if (updating) return
    setUpdating(itemId)

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to remove item')
      }

      await fetchCart() // Refresh cart data
      router.refresh() // Update cart count in header

    } catch (err: any) {
      console.error('Error removing item:', err)
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const clearCart = async () => {
    if (updating) return
    setUpdating('all')

    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to clear cart')
      }

      await fetchCart() // Refresh cart data
      router.refresh() // Update cart count in header

    } catch (err: any) {
      console.error('Error clearing cart:', err)
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  // Calculate totals
  const subtotal = cart?.items.reduce((total, item) => {
    return total + (item.variant?.price || item.product.price) * item.quantity
  }, 0) ?? 0

  const shipping = 0 // Free shipping for now
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null)
              fetchCart()
            }}
            className="mt-4 text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!cart?.items.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400" />
          <h2 className="mt-4 text-2xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Add some items to get started!</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-grow">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Shopping Cart</h2>
              <button
                onClick={clearCart}
                disabled={updating !== null}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-6">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                  {/* Product image */}
                  <div className="relative w-24 h-24">
                    <Image
                      src={item.variant?.imageUrl || item.product.imageUrl || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* Product details */}
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    {item.variant && (
                      <p className="text-sm text-gray-600">
                        {item.variant.name}
                      </p>
                    )}
                    <p className="text-lg font-semibold mt-1">
                      ₹{((item.variant?.price || item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updating !== null || item.quantity <= 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updating !== null || 
                        item.quantity >= (item.variant?.stock || item.product.stock)}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating !== null}
                      className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {updating === item.id && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className={`w-full block text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                updating !== null ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
