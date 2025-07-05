import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminResponse, createAdminErrorResponse } from '@/lib/admin-response'

// Disable caching for admin endpoints
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json()

    if (action === 'deactivate') {
      // Soft delete - set product as inactive
      const product = await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false },
        include: {
          category: true,
          variants: true
        }
      })

      // Also remove from all carts
      await prisma.cartItem.deleteMany({
        where: { productId: params.id }
      })

      return createAdminResponse({
        success: true,
        message: 'Product deactivated successfully',
        product
      })
    }

    if (action === 'activate') {
      // Reactivate product
      const product = await prisma.product.update({
        where: { id: params.id },
        data: { isActive: true },
        include: {
          category: true,
          variants: true
        }
      })

      return createAdminResponse({
        success: true,
        message: 'Product activated successfully',
        product
      })
    }

    return createAdminErrorResponse('Invalid action', 400)

  } catch (error) {
    console.error('Error updating product status:', error)
    return createAdminErrorResponse('Failed to update product status', 500)
  }
}
