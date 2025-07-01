import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  const kitesCategory = await prisma.category.create({
    data: {
      name: 'Kites',
      description: 'Traditional and modern kites for all occasions'
    }
  })

  const threadsCategory = await prisma.category.create({
    data: {
      name: 'Threads',
      description: 'High-quality kite flying threads and strings'
    }
  })

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      description: 'Essential kite flying accessories and tools'
    }
  })

  // Create products with variants
  const patangKite = await prisma.product.create({
    data: {
      name: 'Traditional Patang Kite',
      description: 'Classic Indian fighter kite perfect for competitions',
      price: 49.99,
      stock: 100,
      imageUrl: 'https://ik.imagekit.io/balajikitehouse/patang.jpg',
      categoryId: kitesCategory.id,
      variants: {
        create: [
          {
            sku: 'PATANG-S',
            name: 'Small',
            price: 49.99,
            stock: 50,
            attributes: {
              size: 'Small',
              material: 'Paper',
              color: 'Multi'
            }
          },
          {
            sku: 'PATANG-L',
            name: 'Large',
            price: 69.99,
            stock: 50,
            attributes: {
              size: 'Large',
              material: 'Paper',
              color: 'Multi'
            }
          }
        ]
      }
    }
  })

  const manjhaThread = await prisma.product.create({
    data: {
      name: 'Special Manjha Thread',
      description: 'Premium quality kite flying thread',
      price: 199.99,
      stock: 50,
      imageUrl: 'https://ik.imagekit.io/balajikitehouse/manjha.jpg',
      categoryId: threadsCategory.id,
      variants: {
        create: [
          {
            sku: 'MANJHA-500',
            name: '500 meters',
            price: 199.99,
            stock: 30,
            attributes: {
              length: '500m',
              strength: 'Regular'
            }
          },
          {
            sku: 'MANJHA-1000',
            name: '1000 meters',
            price: 349.99,
            stock: 20,
            attributes: {
              length: '1000m',
              strength: 'Regular'
            }
          }
        ]
      }
    }
  })

  const kiteReel = await prisma.product.create({
    data: {
      name: 'Professional Kite Reel',
      description: 'Heavy-duty kite reel for smooth thread control',
      price: 299.99,
      stock: 30,
      imageUrl: 'https://ik.imagekit.io/balajikitehouse/reel.jpg',
      categoryId: accessoriesCategory.id,
      variants: {
        create: [
          {
            sku: 'REEL-PLASTIC',
            name: 'Plastic',
            price: 299.99,
            stock: 20,
            attributes: {
              material: 'Plastic',
              color: 'Black'
            }
          },
          {
            sku: 'REEL-METAL',
            name: 'Metal',
            price: 499.99,
            stock: 10,
            attributes: {
              material: 'Metal',
              color: 'Silver'
            }
          }
        ]
      }
    }
  })

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
