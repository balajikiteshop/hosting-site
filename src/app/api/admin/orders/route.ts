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
    // Get query parameters
    const { searchParams } = new URL(request.url)
    
    // Parse pagination parameters
    const { page, limit, skip } = parsePaginationParams(searchParams)
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { paymentId: { contains: search, mode: 'insensitive' } },
        { user: { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Get total count for pagination metadata
    const totalCount = await prisma.order.count({ where })

    // Get paginated orders with full details
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    // Handle deleted products gracefully
    const safeOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product || {
          id: 'deleted',
          name: (item as any).productName || 'Product No Longer Available',
          description: 'This product has been removed',
          price: item.price,
          imageUrl: (item as any).productImage || null,
          stock: 0,
          isActive: false,
          categoryId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        variant: item.variant || ((item as any).variantName ? {
          id: 'deleted',
          name: (item as any).variantName,
          sku: (item as any).variantSku || 'N/A',
          price: item.price,
          stock: 0,
          imageUrl: null,
          attributes: {},
          isActive: false,
          productId: item.productId,
          createdAt: new Date(),
          updatedAt: new Date()
        } : null)
      }))
    }))

    // Create pagination metadata and response
    const pagination = createPaginationMeta(page, limit, totalCount)
    const response = createPaginatedResponse(safeOrders, pagination)

    return createAdminResponse(response)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return createAdminErrorResponse('Failed to fetch orders', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return createAdminErrorResponse('Order ID and status are required', 400)
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return createAdminResponse(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return createAdminErrorResponse('Failed to update order', 500)
  }
}
