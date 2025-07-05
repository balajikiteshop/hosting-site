import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/user-auth'

// Get cart contents
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from JWT
    const userPayload = await getUserFromRequest(request)

    // Check if user is authenticated
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: userPayload.id }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // First find or create cart for user
    let cart = await prisma.cart.findFirst({
      where: { userId: dbUser.id },
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
        data: { userId: dbUser.id },
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
    const userPayload = await getUserFromRequest(request)

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: userPayload.id }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const data = await request.json()
    const { productId, variantId, quantity, action = 'add', requestId } = data // action can be 'add' or 'set'

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate quantity
    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    console.log('Add to cart request received:', { 
      requestId,
      userId: dbUser.id, 
      productId, 
      variantId, 
      quantity, 
      action,
      timestamp: new Date().toISOString()
    })

    let cart = await prisma.cart.findFirst({
      where: { userId: dbUser.id }
    })

    if (!cart) {
      console.log('Creating new cart for user:', dbUser.id)
      cart = await prisma.cart.create({
        data: { userId: dbUser.id }
      })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null
      }
    })

    console.log('Existing item check:', { 
      existingItem: existingItem ? { id: existingItem.id, quantity: existingItem.quantity } : null 
    })

    if (existingItem) {
      if (action === 'set') {
        // Set the quantity to the specified amount
        console.log('Setting quantity to:', quantity)
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: quantity }
        })
      } else {
        // Add to existing quantity (default behavior)
        const newQuantity = existingItem.quantity + quantity
        console.log('Adding to existing quantity:', { oldQuantity: existingItem.quantity, addQuantity: quantity, newQuantity })
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity }
        })
      }
    } else {
      console.log('Creating new cart item with quantity:', quantity)
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity
        }
      })
    }

    console.log('Add to cart completed successfully')

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
    const userPayload = await getUserFromRequest(request)

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: userPayload.id }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const cart = await prisma.cart.findFirst({
      where: { userId: dbUser.id }
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
