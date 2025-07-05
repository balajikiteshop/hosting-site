import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { createAdminResponse, createAdminErrorResponse } from '@/lib/admin-response'
import { parsePaginationParams, createPaginationMeta, createPaginatedResponse } from '@/lib/pagination'

// Disable caching for admin endpoints
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse pagination parameters
    const { page, limit, skip } = parsePaginationParams(searchParams)
    const search = searchParams.get('search') || ''
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Get total count for pagination metadata
    const totalCount = await prisma.category.count({ where })
    
    // Get paginated categories
    const categories = await prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    })
    
    // Create pagination metadata and response
    const pagination = createPaginationMeta(page, limit, totalCount)
    const response = createPaginatedResponse(categories, pagination)
    
    return createAdminResponse(response)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return createAdminErrorResponse('Failed to fetch categories', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, description } = data

    // Validate input data
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Category name is too long' }, { status: 400 })
    }

    if (description && typeof description !== 'string') {
      return NextResponse.json({ error: 'Invalid description format' }, { status: 400 })
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Description is too long' }, { status: 400 })
    }

    // Check for duplicate category name
    const existingCategory = await prisma.category.findFirst({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
