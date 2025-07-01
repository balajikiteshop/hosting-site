import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: true
      }
    })
    console.log('Products found:', products.length)
    console.log('Products:', JSON.stringify(products, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
