'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import type { Cart } from '@/types/product'

declare global {
  interface Window {
    Razorpay: any
  }
}

// Load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin?callbackUrl=/checkout')
    }

    // Pre-fill form with user data if available
    if (session?.user?.name || session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        customerName: session?.user?.name || prev.customerName,
        customerEmail: session?.user?.email || prev.customerEmail
      }))
    }
  }, [session, status])

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (!res.ok) {
        if (res.status === 401) {
          redirect('/auth/signin?callbackUrl=/checkout')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart?.items.length) return
    setSubmitting(true)
    setError(null)

    try {
      // Load Razorpay script first
      const isLoaded = await loadRazorpay()
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay script')
      }

      // Create order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          })),
          ...formData
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create order')
      }

      const { order, razorpayOrder } = await res.json()

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error('Razorpay key is not configured')
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: order.currency,
        name: 'Balaji Kite House',
        description: `Order #${order.id}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            })

            if (!verifyRes.ok) {
              const errorData = await verifyRes.json()
              throw new Error(errorData.error || 'Payment verification failed')
            }

            // Clear cart
            await fetch('/api/cart', { method: 'DELETE' })

            // Redirect to success page
            router.push(`/order-success?orderId=${order.id}`)
          } catch (err: any) {
            console.error('Payment verification failed:', err)
            setError(err.message || 'Payment verification failed. Please contact support.')
            setSubmitting(false)
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false)
          }
        },
        theme: {
          color: '#2563eb'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (err: any) {
      console.error('Checkout failed:', err)
      setError(err.message || 'Checkout failed. Please try again.')
      setSubmitting(false)
    }
  }

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
          <h2 className="text-2xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Add some items to proceed with checkout.</p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Cart
          </Link>
        </div>
      </div>
    )
  }

  // Calculate totals
  const subtotal = cart.items.reduce((total, item) => {
    return total + (item.variant?.price || item.product.price) * item.quantity
  }, 0)

  const shipping = 0 // Free shipping for now
  const total = subtotal + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Order Form */}
        <div className="flex-grow">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    customerName: e.target.value
                  }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    customerEmail: e.target.value
                  }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    customerPhone: e.target.value
                  }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Address
                </label>
                <textarea
                  required
                  value={formData.shippingAddress}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    shippingAddress: e.target.value
                  }))}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${total.toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16">
                    <Image
                      src={item.variant?.imageUrl || item.product.imageUrl || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.product.name}</h4>
                    {item.variant && (
                      <p className="text-sm text-gray-600">{item.variant.name}</p>
                    )}
                    <p className="text-sm">
                      {item.quantity} × ₹{(item.variant?.price || item.product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t">
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
              href="/cart"
              className="mt-4 text-blue-600 hover:underline flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
