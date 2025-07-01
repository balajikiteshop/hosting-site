'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import type { Product, ProductVariant } from '@/types/product'
import { useRouter } from 'next/navigation'

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
  quantity = 1,
  disabled = false,
  className = ""
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addToCart = async () => {
    if (disabled || isAdding) return
    setIsAdding(true)
    setError(null)
    
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: variant?.id,
          quantity
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add to cart')
      }

      // Refresh page to update cart count
      router.refresh()

      // Optional: Show success message
      const button = document.activeElement as HTMLButtonElement
      const originalText = button.innerText
      button.innerText = 'Added! ✓'
      setTimeout(() => {
        button.innerText = originalText
      }, 2000)

    } catch (err: any) {
      console.error('Error adding to cart:', err)
      setError(err.message)
    } finally {
      setIsAdding(false)
    }
  }

  const maxStock = variant ? variant.stock : product.stock
  const outOfStock = maxStock < 1
  const finalPrice = variant ? variant.price : product.price

  return (
    <div className="flex flex-col items-start gap-2">
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      <button
        onClick={addToCart}
        disabled={disabled || outOfStock || isAdding}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <ShoppingCart className="w-5 h-5" />
        {isAdding ? (
          'Adding...'
        ) : outOfStock ? (
          'Out of Stock'
        ) : (
          <>
            Add to Cart - ₹{finalPrice.toFixed(2)}
          </>
        )}
      </button>
    </div>
  )
}
