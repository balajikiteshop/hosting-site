'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import type { Product, ProductVariant } from '@/types/product'

interface AddToCartButtonProps {
  product: Product
  variant?: ProductVariant | null
  quantity: number
  disabled?: boolean
  className?: string
}

export default function AddToCartButton({ 
  product, 
  variant,
  quantity,
  disabled = false,
  className = ""
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { user, loading } = useUser()
  const router = useRouter()
  const lastClickTime = useRef<number>(0)
  const requestInProgress = useRef<boolean>(false)
  const requestId = useRef<string>('')

  const addToCart = async () => {
    // Prevent rapid double-clicks (debounce with 1.5 second minimum interval)
    const now = Date.now()
    if (now - lastClickTime.current < 1500) {
      console.log('Preventing rapid double-click')
      return
    }
    lastClickTime.current = now

    // Check if a request is already in progress
    if (requestInProgress.current) {
      console.log('Request already in progress, ignoring click')
      return
    }

    // Check if user is authenticated
    if (!user && !loading) {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    // Prevent double-clicks and multiple concurrent requests
    if (disabled || isAdding || loading || success) {
      console.log('Button disabled or already processing')
      return
    }

    // Ensure we have a valid quantity
    const validQuantity = Math.max(1, quantity || 1)
    
    // Generate unique request ID
    const currentRequestId = `${Date.now()}-${Math.random()}`
    requestId.current = currentRequestId
    
    requestInProgress.current = true
    setIsAdding(true)
    setError(null)
    setSuccess(false)
    
    console.log('Adding to cart:', { 
      requestId: currentRequestId,
      productId: product.id, 
      variantId: variant?.id, 
      quantity: validQuantity,
      timestamp: new Date().toISOString()
    })
    
    try {
      // Check if this request is still current (not superseded by another click)
      if (requestId.current !== currentRequestId) {
        console.log('Request superseded, aborting')
        return
      }

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: variant?.id,
          quantity: validQuantity,
          requestId: currentRequestId
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add to cart')
      }

      // Show success state without refreshing the page
      setSuccess(true)
      
      // Reset success state after 2 seconds (reduced from 3)
      setTimeout(() => {
        setSuccess(false)
        requestInProgress.current = false
      }, 2000)

      // Trigger a custom event to update cart count in navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'))

    } catch (err: any) {
      console.error('Error adding to cart:', err)
      setError(err.message)
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null)
      }, 5000)
    } finally {
      setIsAdding(false)
      requestInProgress.current = false
    }
  }

  const maxStock = variant ? variant.stock : product.stock
  const outOfStock = maxStock < 1
  const finalPrice = variant ? variant.price : product.price

  // Determine button text and state
  const getButtonText = () => {
    if (loading) return 'Loading...'
    if (!user) return 'Sign in to Add to Cart'
    if (isAdding) return 'Adding...'
    if (success) return 'Added! ✓'
    if (outOfStock) return 'Out of Stock'
    return 'Add to Cart'
  }

  const getButtonStyle = () => {
    if (success) return 'bg-green-600 text-white'
    if (!user) return 'bg-indigo-600 text-white hover:bg-indigo-700'
    if (outOfStock) return 'bg-gray-400 text-white cursor-not-allowed'
    return 'bg-blue-600 text-white hover:bg-blue-700'
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      <button
        onClick={addToCart}
        disabled={disabled || (outOfStock && !!user) || isAdding || loading || success}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${getButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <ShoppingCart className="w-5 h-5" />
        {getButtonText()}
      </button>
    </div>
  )
}
