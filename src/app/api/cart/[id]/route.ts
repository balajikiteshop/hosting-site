import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

// Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: {
        cart: true,
        product: true,
        variant: true
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Check stock
    const availableStock = cartItem.variant 
      ? cartItem.variant.stock 
      : cartItem.product.stock

    if (availableStock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
      include: {
        product: true,
        variant: true
      }
    })

    return NextResponse.json(updatedItem)

  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { cart: true }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    if (cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
