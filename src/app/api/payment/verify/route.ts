import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_SECRET is not configured')
    }

    const body = await request.json()
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    } = body

    // Verify payment signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paymentId: razorpayPaymentId,
        status: 'CONFIRMED'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Update product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json({ success: true, order })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
