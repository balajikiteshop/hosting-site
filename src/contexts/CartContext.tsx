'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartContextType {
  cartCount: number
  updateCartCount: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        const count = data.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0
        setCartCount(count)
      } else if (response.status === 401) {
        // User not authenticated, set cart count to 0
        setCartCount(0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
      setCartCount(0) // Set to 0 on error
    }
  }

  const updateCartCount = () => {
    fetchCartCount()
  }

  useEffect(() => {
    // Initial cart count fetch
    fetchCartCount()

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
