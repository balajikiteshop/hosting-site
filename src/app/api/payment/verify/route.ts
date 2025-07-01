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
        paymentStatus: 'paid',
        paymentId: razorpayPaymentId,
        status: 'processing'
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    })

    // Note: Stock was already decreased at order creation
    // Here we only update the order status

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      order
    })

  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
