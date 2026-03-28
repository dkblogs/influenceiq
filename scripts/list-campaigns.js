const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function list() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const brandIds = [...new Set(campaigns.map(c => c.brandId))]
  const brands = await prisma.user.findMany({
    where: { id: { in: brandIds } },
    select: { id: true, name: true, email: true }
  })
  const brandMap = Object.fromEntries(brands.map(b => [b.id, b]))

  console.log(`Total campaigns: ${campaigns.length}`)
  campaigns.forEach(c => {
    const brand = brandMap[c.brandId]
    console.log(`\n  Title: ${c.title}`)
    console.log(`  Brand: ${brand?.name} (${brand?.email})`)
    console.log(`  Status: ${c.status}`)
    console.log(`  Created: ${c.createdAt}`)
  })

  await prisma.$disconnect()
}

list().catch(console.error)
