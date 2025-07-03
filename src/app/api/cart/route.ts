import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/user-auth'

// Get cart contents
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from JWT
    const user = await getUserFromRequest(request)

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // First find or create cart for user
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: true,
              variant: true
            }
          }
        }
      })
    }

    return NextResponse.json(cart)

  } catch (error) {
    console.error('Error getting cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add item to cart 
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { productId, variantId, quantity } = data

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: user.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id }
      })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null
      }
    })

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
