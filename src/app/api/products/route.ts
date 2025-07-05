import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Disable caching for this API route to show real-time product updates
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const search = searchParams.get('search')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')

    // Build where clause with proper validation
    const whereClause: any = { isActive: true }

    // Validate and add category filter if provided
    if (categoryId) {
      if (typeof categoryId === 'string' && categoryId.trim().length > 0) {
        const sanitizedCategoryId = categoryId.trim()
        if (sanitizedCategoryId.length <= 50 && /^[a-zA-Z0-9\-_]+$/.test(sanitizedCategoryId)) {
          whereClause.categoryId = sanitizedCategoryId
        }
      }
    }

    // Validate and add search filter if provided
    if (search) {
      if (typeof search === 'string' && search.trim().length > 0) {
        const sanitizedSearch = search.trim().slice(0, 100) // Limit search term length
        whereClause.OR = [
          { name: { contains: sanitizedSearch, mode: 'insensitive' } },
          { description: { contains: sanitizedSearch, mode: 'insensitive' } }
        ]
      }
    }

    // Validate pagination parameters
    let parsedPage = 1
    let parsedLimit = 50

    if (page) {
      const pageNum = parseInt(page, 10)
      if (!isNaN(pageNum) && pageNum > 0 && pageNum <= 1000) {
        parsedPage = pageNum
      }
    }

    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) {
        parsedLimit = limitNum
      }
    }

    const skip = (parsedPage - 1) * parsedLimit

    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        categoryId: true,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: parsedLimit
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
