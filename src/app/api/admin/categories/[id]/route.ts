import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'

// Disable caching for admin endpoints
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate the category ID parameter
    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    // Sanitize the ID (basic validation for common ID formats)
    const sanitizedId = params.id.trim()
    if (sanitizedId.length > 50 || !/^[a-zA-Z0-9\-_]+$/.test(sanitizedId)) {
      return NextResponse.json({ error: 'Invalid category ID format' }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { id: sanitizedId },
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

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate the category ID parameter
    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    // Sanitize the ID
    const sanitizedId = params.id.trim()
    if (sanitizedId.length > 50 || !/^[a-zA-Z0-9\-_]+$/.test(sanitizedId)) {
      return NextResponse.json({ error: 'Invalid category ID format' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description } = body

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

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: sanitizedId }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if another category with the same name exists (excluding current one)
    const duplicateName = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        id: { not: sanitizedId }
      }
    })

    if (duplicateName) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }

    const updatedCategory = await prisma.category.update({
      where: { id: sanitizedId },
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

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate the category ID parameter
    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    // Sanitize the ID
    const sanitizedId = params.id.trim()
    if (sanitizedId.length > 50 || !/^[a-zA-Z0-9\-_]+$/.test(sanitizedId)) {
      return NextResponse.json({ error: 'Invalid category ID format' }, { status: 400 })
    }

    // Check if category exists and get product count
    const category = await prisma.category.findUnique({
      where: { id: sanitizedId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category "${category.name}" because it has ${category._count.products} product(s). Please move or delete the products first.` 
      }, { status: 400 })
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: sanitizedId }
    })

    return NextResponse.json({ 
      message: `Category "${category.name}" deleted successfully` 
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    
    if (error instanceof Error) {
      // Handle foreign key constraint errors
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ 
          error: 'Cannot delete category because it has associated products. Please remove all products from this category first.' 
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
