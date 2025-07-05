import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { deleteImageFromImageKit } from '@/lib/imagekit-server'

// Disable caching for this API route to show real-time product updates
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate the product ID parameter
    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Sanitize the ID (basic validation for common ID formats)
    const sanitizedId = params.id.trim()
    if (sanitizedId.length > 50 || !/^[a-zA-Z0-9\-_]+$/.test(sanitizedId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const product = await prisma.product.findFirst({
      where: { 
        id: sanitizedId,
        isActive: true
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
          orderBy: { price: 'asc' },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
            attributes: true,
            isActive: true,
            productId: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      price,
      imageUrl, 
      stock,
      isActive = true,
      categoryId 
    } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        imageUrl,
        stock,
        isActive,
        categoryId
      },
      include: {
        category: true,
        variants: {
          where: { isActive: true }
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First get the product to get its imageUrl
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If product has an image, delete it from ImageKit
    if (product.imageUrl) {
      await deleteImageFromImageKit(product.imageUrl);
    }

    // Then delete the product from the database
    await prisma.product.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
