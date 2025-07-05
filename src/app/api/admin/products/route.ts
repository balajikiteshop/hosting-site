import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminResponse, createAdminErrorResponse } from '@/lib/admin-response'
import { parsePaginationParams, createPaginationMeta, createPaginatedResponse } from '@/lib/pagination'

// Disable caching for admin endpoints
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // The middleware ensures this endpoint is only accessible by authenticated admins
    const { searchParams } = new URL(request.url)
    
    // Parse pagination parameters
    const { page, limit, skip } = parsePaginationParams(searchParams)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const isActive = searchParams.get('isActive')
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }
    
    // Get total count for pagination metadata
    const totalCount = await prisma.product.count({ where })
    
    // Get paginated products
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        variants: true,
        _count: {
          select: {
            orderItems: true,
            cartItems: true
          }
        }
      }
    })
    
    // Create pagination metadata and response
    const pagination = createPaginationMeta(page, limit, totalCount)
    const response = createPaginatedResponse(products, pagination)
    
    return createAdminResponse(response)
  } catch (error) {
    console.error('Error fetching products:', error)
    return createAdminErrorResponse('Failed to fetch products', 500)
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
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true, // Default to true if not provided
        variants: {
          create: data.variants
        }
      },
      include: {
        category: true,
        variants: true
      }
    })
    return createAdminResponse(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return createAdminErrorResponse('Failed to create product', 500)
  }
}