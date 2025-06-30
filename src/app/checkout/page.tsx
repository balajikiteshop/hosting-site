'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

declare global {
  interface Window {
    Razorpay: any
  }
}

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

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: ''
  })
  const router = useRouter()

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          ...formData,
          userId: 'guest' // For now, using guest user
        })
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount, // Amount already in paise from backend
        currency: orderData.currency,
        name: 'Balaji Kite House',
        description: 'Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderData.orderId
              })
            })

            if (verifyResponse.ok) {
              // Clear cart
              localStorage.removeItem('cart')
              // Redirect to success page
              router.push(`/order-success?orderId=${orderData.orderId}`)
            } else {
              alert('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed')
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone
        },
        theme: {
          color: '#2563eb'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 animate-fadeIn">
          <div className="text-6xl mb-4 animate-float">🛒</div>
          <h2 className="text-2xl font-bold heading-gradient mb-4">No items in cart</h2>
          <p className="mt-2 text-gray-600 mb-6">Add items to your cart before checkout</p>
          <Link href="/products" className="btn-primary hover-lift">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold heading-gradient mb-8 text-shadow animate-fadeIn">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="animate-slideIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
          <form onSubmit={handlePayment} className="card-enhanced p-6 space-y-6">
            <div className="form-group">
              <label htmlFor="customerName" className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerEmail" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerPhone" className="form-label">
                Phone Number *
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="shippingAddress" className="form-label">
                Shipping Address *
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleInputChange}
                required
                rows={3}
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full hover-lift ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Pay ₹${getTotalPrice().toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
          <div className="card-enhanced p-6 kite-shadow">
            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-blue-600">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold bg-blue-50 p-4 rounded-lg">
                <span>Total</span>
                <span className="text-blue-600">₹{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
