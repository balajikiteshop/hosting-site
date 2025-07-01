import { createRazorpayOrder } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { 
      items, 
      customerName, 
      customerEmail, 
      customerPhone, 
      shippingAddress,
    } = body

    // Calculate total amount
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      // Fetch product
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true
        }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }

      // If variant is specified, fetch and validate it
      let finalPrice = product.price
      let availableStock = product.stock
      let variant = null

      if (item.variantId) {
        const variantData = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true
          }
        })

        if (!variantData) {
          return NextResponse.json(
            { error: `Variant ${item.variantId} not found for product ${item.productId}` },
            { status: 400 }
          )
        }

        variant = variantData
        finalPrice = variant.price
        availableStock = variant.stock
      }

      // Check stock
      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}${variant ? ` (${variant.name})` : ''}` },
          { status: 400 }
        )
      }

      // Calculate total
      const itemTotal = finalPrice * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: finalPrice
      })

      // Update stock
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        })
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }
    }      // Create order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
        amount: totalAmount,
        currency: 'INR',
        status: 'pending',
        paymentStatus: 'pending',
        shippingInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: shippingAddress
        },
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: totalAmount * 100, // Convert to paise
      orderId: order.id,
      receipt: order.id,
      currency: 'INR'
    })

    return NextResponse.json({
      order,
      razorpayOrder
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
