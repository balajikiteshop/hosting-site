import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/user-auth'

// Disable caching for order endpoints
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        paymentStatus: true,
        paymentId: true,
        shippingInfo: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            productId: true,
            variantId: true,
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
                attributes: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user owns the order
    if (order.user.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Handle deleted products gracefully
    const safeOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product || {
          id: item.productId,
          name: 'Product No Longer Available',
          description: 'This product has been removed from our catalog',
          imageUrl: null
        },
        variant: item.variant || null
      }))
    }

    return NextResponse.json(safeOrder)

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
