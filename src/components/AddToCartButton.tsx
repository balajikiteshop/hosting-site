'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image: string | null
  stock: number
}

interface AddToCartButtonProps {
  product: Product
  className?: string
}

export default function AddToCartButton({ product, className = "" }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)

  const addToCart = () => {
    setIsAdding(true)
    
    try {
      // Get existing cart from localStorage
      const existingCart = localStorage.getItem('cart')
      let cart = existingCart ? JSON.parse(existingCart) : []

      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex((item: any) => item.product.id === product.id)

      if (existingItemIndex >= 0) {
        // Update quantity if product exists
        cart[existingItemIndex].quantity += 1
      } else {
        // Add new item to cart
        cart.push({
          id: `cart_${product.id}_${Date.now()}`,
          quantity: 1,
          product: product
        })
      }

      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart))
      
      // Show success feedback (you could replace this with a toast notification)
      alert('Product added to cart!')
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add product to cart')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      onClick={addToCart}
      disabled={isAdding || product.stock === 0}
      className={`btn-success flex items-center justify-center space-x-2 hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-4 py-2 ${className}`}
    >
      {isAdding ? (
        <>
          <div className="spinner"></div>
          <span>Adding...</span>
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  )
}
