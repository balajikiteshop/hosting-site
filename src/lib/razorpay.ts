import Razorpay from 'razorpay'

interface RazorpayOrderParams {
  amount: number;
  orderId: string;
  receipt: string;
  currency?: string;
}

// Initialize Razorpay with error handling and validation
const initializeRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured')
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

// Lazy initialization of Razorpay instance
let razorpayInstance: Razorpay | null = null

export const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = initializeRazorpay()
  }
  return razorpayInstance
}

// Create Razorpay order with validation and error handling
export const createRazorpayOrder = async ({
  amount,
  orderId,
  receipt,
  currency = 'INR'
}: RazorpayOrderParams) => {
  try {
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid order amount')
    }

    // Validate orderId and receipt
    if (!orderId || !receipt) {
      throw new Error('Order ID and receipt are required')
    }

    const razorpay = getRazorpay()

    // Create the order
    const order = await razorpay.orders.create({
      amount: Math.round(amount), // Ensure amount is an integer in paise
      currency,
      receipt,
      notes: {
        orderId
      }
    })

    if (!order || !order.id) {
      throw new Error('Failed to create Razorpay order')
    }

    return order
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error)
    throw new Error(error.message || 'Failed to create Razorpay order')
  }
}

// Verify Razorpay payment signature
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  if (!orderId || !paymentId || !signature) {
    throw new Error('Missing payment verification parameters')
  }

  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  hmac.update(`${orderId}|${paymentId}`)
  const generatedSignature = hmac.digest('hex')

  return generatedSignature === signature
}

// Get payment details from Razorpay
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const razorpay = getRazorpay()
    return await razorpay.payments.fetch(paymentId)
  } catch (error: any) {
    console.error('Failed to fetch payment details:', error)
    throw new Error('Failed to fetch payment details')
  }
}

// Refund payment
export const refundPayment = async (
  paymentId: string,
  amount?: number
) => {
  try {
    const razorpay = getRazorpay()
    const refundOptions = amount ? { amount: Math.round(amount * 100) } : {}
    return await razorpay.payments.refund(paymentId, refundOptions)
  } catch (error: any) {
    console.error('Failed to process refund:', error)
    throw new Error('Failed to process refund')
  }
}
