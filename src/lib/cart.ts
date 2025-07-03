import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { getUserFromCookies } from '@/lib/user-auth'

type CartItem = {
  productId: string
  variantId?: string
  quantity: number
}

export async function getCart() {
  const userPayload = await getUserFromCookies()

  // For authenticated users, get cart from database
  if (userPayload?.id) {
    let cart = await prisma.cart.findFirst({
      where: { userId: userPayload.id },
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
        data: {
          userId: userPayload.id
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
    }

    return cart
  }

  // For guests, use cookie-based cart
  const cartCookie = cookies().get('cart')
  if (!cartCookie) {
    return { items: [] }
  }

  try {
    const cart = JSON.parse(cartCookie.value)
    // Fetch products and variants for cart items
    const itemsWithProducts = await Promise.all(
      cart.items.map(async (item: CartItem) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            variants: item.variantId ? {
              where: { id: item.variantId }
            } : undefined
          }
        })
        return {
          ...item,
          product,
          variant: product?.variants?.[0]
        }
      })
    )
    return { items: itemsWithProducts }
  } catch (error) {
    console.error('Error parsing cart cookie:', error)
    return { items: [] }
  }
}

export async function addToCart(item: CartItem) {
  const userPayload = await getUserFromCookies()

  // For authenticated users, add to database cart
  if (userPayload?.id) {
    let cart = await prisma.cart.findFirst({
      where: { userId: userPayload.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userPayload.id
        }
      })
    }

    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: item.productId,
        variantId: item.variantId
      }
    })

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + item.quantity
        }
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        }
      })
    }

    return await getCart()
  }

  // For guests, use cookie-based cart
  const cartCookie = cookies().get('cart')
  const cart = cartCookie ? JSON.parse(cartCookie.value) : { items: [] }
  
  const existingItemIndex = cart.items.findIndex((i: CartItem) => 
    i.productId === item.productId && i.variantId === item.variantId
  )

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += item.quantity
  } else {
    cart.items.push(item)
  }

  cookies().set('cart', JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  return cart
}

export async function removeFromCart(productId: string, variantId?: string) {
  const userPayload = await getUserFromCookies()

  // For authenticated users, remove from database cart
  if (userPayload?.id) {
    const cart = await prisma.cart.findFirst({
      where: { userId: userPayload.id }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
          variantId
        }
      })
    }

    return await getCart()
  }

  // For guests, use cookie-based cart
  const cartCookie = cookies().get('cart')
  if (!cartCookie) return { items: [] }

  const cart = JSON.parse(cartCookie.value)
  cart.items = cart.items.filter((i: CartItem) => 
    !(i.productId === productId && i.variantId === variantId)
  )

  cookies().set('cart', JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  return cart
}
