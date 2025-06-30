import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: params.id }
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description } = body

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}
