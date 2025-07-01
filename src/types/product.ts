export interface ProductAttributes {
  color?: string
  size?: string
  material?: string
  level?: string
  [key: string]: string | undefined
}

export interface ProductVariant {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  attributes: Record<string, string | undefined>
  productId: string
  isActive: boolean
}

// Product interface matching our Prisma schema
export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  stock: number
  categoryId: string | null
  isActive: boolean
  variants: ProductVariant[]
  category?: {
    id: string
    name: string
    description: string | null
  } | null
}

// Cart product is a simplified version with computed final price
export interface CartProduct {
  id: string
  name: string
  price: number // Price without variant adjustment
  finalPrice: number // Final price including variant if selected
  imageUrl: string | null
  variant?: CartProductVariant
}

export interface CartProductVariant {
  id: string
  sku: string
  name: string
  price: number
  attributes: Record<string, string | undefined>
}

export interface CartItem {
  id: string
  quantity: number
  productId: string
  variantId?: string | null
  product: Product
  variant?: ProductVariant | null
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

// Helper function to convert Product to CartProduct
export function toCartProduct(product: Product, variant?: ProductVariant): CartProduct {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    finalPrice: variant ? variant.price : product.price,
    imageUrl: variant?.imageUrl || product.imageUrl,
    variant: variant ? {
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      price: variant.price,
      attributes: variant.attributes
    } : undefined
  };
}
