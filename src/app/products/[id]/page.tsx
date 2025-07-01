import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductDetails from './ProductDetails'
import type { Product, ProductVariant } from '@/types/product'

async function getProduct(id: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { 
      id,
      isActive: true 
    },
    include: {
      category: true,
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' }
      }
    }
  })

  if (!product) {
    return null
  }

  // Convert decimal prices to numbers and ensure all required fields are present
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    stock: product.stock,
    categoryId: product.categoryId,
    isActive: product.isActive,
    variants: product.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: Number(v.price),
      stock: v.stock,
      imageUrl: v.imageUrl,
      attributes: v.attributes as Record<string, string>,
      productId: v.productId,
      isActive: v.isActive
    })),
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description
        }
      : null
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
