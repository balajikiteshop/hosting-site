import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/auth/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    if (!session?.user?.id) {
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

    // Check if user owns the order or is admin
    if (order.user.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(order)

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
