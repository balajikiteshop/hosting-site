import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create categories
  const traditionalCategory = await prisma.category.create({
    data: {
      name: 'Traditional Kites',
      description: 'Classic and traditional kite designs'
    }
  })

  const modernCategory = await prisma.category.create({
    data: {
      name: 'Modern Kites',
      description: 'Contemporary and innovative kite designs'
    }
  })

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      description: 'Kite flying accessories and tools'
    }
  })

  // Create sample user
  const user = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'Sample Customer',
      phone: '+91 9876543210',
      address: '123 Sample Street, Sample City'
    }
  })

  // Create products
  const products = [
    {
      name: 'Classic Diamond Kite',
      description: 'A beautiful traditional diamond-shaped kite perfect for beginners.',
      price: 299,
      stock: 50,
      categoryId: traditionalCategory.id
    },
    {
      name: 'Fighter Kite',
      description: 'Traditional fighter kite for competitive flying.',
      price: 199,
      stock: 75,
      categoryId: traditionalCategory.id
    },
    {
      name: 'Box Kite',
      description: 'Stable and sturdy box kite ideal for windy conditions.',
      price: 899,
      stock: 25,
      categoryId: modernCategory.id
    },
    {
      name: 'Delta Wing Kite',
      description: 'Modern triangular kite with excellent stability.',
      price: 649,
      stock: 30,
      categoryId: modernCategory.id
    },
    {
      name: 'Stunt Kite',
      description: 'Professional dual-line stunt kite for advanced maneuvers.',
      price: 1299,
      stock: 15,
      categoryId: modernCategory.id
    },
    {
      name: 'Kite String (100m)',
      description: 'High-quality kite flying string, 100 meters.',
      price: 99,
      stock: 100,
      categoryId: accessoriesCategory.id
    },
    {
      name: 'Kite Reel',
      description: 'Durable plastic kite reel for easy handling.',
      price: 149,
      stock: 60,
      categoryId: accessoriesCategory.id
    },
    {
      name: 'Tail Attachments Set',
      description: 'Colorful tail attachments to stabilize your kite.',
      price: 79,
      stock: 80,
      categoryId: accessoriesCategory.id
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
