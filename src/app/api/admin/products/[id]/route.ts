import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminResponse, createAdminErrorResponse } from '@/lib/admin-response'

// Disable caching for admin endpoints
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true
      }
    })
    if (!product) {
      return createAdminErrorResponse('Product not found', 404)
    }
    return createAdminResponse(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return createAdminErrorResponse('Failed to fetch product', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        variants: {
          deleteMany: {},
          create: data.variants
        }
      },
      include: {
        category: true,
        variants: true
      }
    })
    return createAdminResponse(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return createAdminErrorResponse('Failed to update product', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if product exists in any orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: params.id }
    })

    if (orderItemsCount > 0) {
      return createAdminErrorResponse(
        `Cannot delete product. It's referenced in ${orderItemsCount} order(s). Consider deactivating it instead.`,
        400
      )
    }

    // Check if product exists in any carts
    const cartItemsCount = await prisma.cartItem.count({
      where: { productId: params.id }
    })

    if (cartItemsCount > 0) {
      // Remove from carts first
      await prisma.cartItem.deleteMany({
        where: { productId: params.id }
      })
    }

    // Safe to delete
    await prisma.product.delete({
      where: { id: params.id }
    })
    
    return createAdminResponse({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return createAdminErrorResponse('Failed to delete product', 500)
  }
}