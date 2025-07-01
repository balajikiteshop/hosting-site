import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
            attributes: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, stock, categoryId, imageUrl, variants } = body

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        imageUrl,
        isActive: true,
        variants: {
          create: variants?.map((v: any) => ({
            sku: v.sku,
            name: v.name,
            price: parseFloat(v.price),
            stock: parseInt(v.stock),
            imageUrl: v.imageUrl,
            attributes: v.attributes,
            isActive: true
          })) || []
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        variants: {
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
            attributes: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
