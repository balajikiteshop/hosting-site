'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  customerName: string
  customerEmail: string
  status: string
  paymentStatus: string
  items: Array<{
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId)
    }
  }, [orderId])

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (response.ok) {
        const orderData = await response.json()
        setOrder(orderData)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner spinner-large mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading your order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <Link
            href="/products"
            className="btn-primary inline-block"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-success-50 rounded-full mb-6 animate-bounceIn">
          <CheckCircle className="h-16 w-16 text-success-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-xl text-gray-600">
          Thank you for your purchase. We'll start processing your order right away.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-8 mb-12 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="card-enhanced p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Number</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`status-badge-enhanced ${
                  order.status === 'confirmed' ? 'status-confirmed-enhanced' : 
                  order.status === 'pending' ? 'status-pending-enhanced' :
                  'status-delivered-enhanced'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment</span>
                <span className={`status-badge-enhanced ${
                  order.paymentStatus === 'paid' ? 'status-delivered-enhanced' : 'status-pending-enhanced'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card-enhanced p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{order.customerEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-enhanced p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Items Ordered</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <span className="text-xl mr-4">🎁</span>
                  <div>
                    <span className="font-medium text-gray-900">{item.product.name}</span>
                    <div className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</div>
                  </div>
                </div>
                <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-primary-600">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4 md:space-y-0 md:space-x-4">
        <Link
          href="/products"
          className="btn-primary inline-flex items-center justify-center"
        >
          Continue Shopping
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link
          href="/"
          className="btn-secondary inline-flex items-center justify-center"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
