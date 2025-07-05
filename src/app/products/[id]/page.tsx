import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductDetails from './ProductDetails'
import type { Product, ProductVariant } from '@/types/product'

// Disable caching for this page to show real-time product updates
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getProduct(id: string): Promise<Product | null> {
  try {
    // Validate the product ID parameter
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return null
    }

    // Sanitize the ID (basic validation for common ID formats)
    const sanitizedId = id.trim()
    if (sanitizedId.length > 50 || !/^[a-zA-Z0-9\-_]+$/.test(sanitizedId)) {
      return null
    }

    const product = await prisma.product.findFirst({
      where: { 
        id: sanitizedId,
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
        categoryId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
            attributes: true,
            isActive: true,
            productId: true
          }
        }
      }
    })

    if (!product) {
      return null
    }

    // Convert the raw product to match our Product type
    return {
      ...product,
      variants: product.variants.map(v => ({
        ...v,
        attributes: v.attributes as Record<string, string | undefined>
      }))
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({
  params
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} />
    </div>
  )
}
