import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // The middleware ensures this endpoint is only accessible by authenticated admins
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        variants: {
          create: data.variants
        }
      },
      include: {
        category: true,
        variants: true
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}