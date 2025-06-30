import { createRazorpayOrder } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      items, 
      customerName, 
      customerEmail, 
      customerPhone, 
      shippingAddress,
      userId 
    } = body

    // Calculate total amount
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      })
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(totalAmount)

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        totalAmount,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        razorpayOrderId: razorpayOrder.id,
        userId,
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

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR'
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
