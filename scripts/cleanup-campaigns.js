const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanup() {
  // Get all valid user IDs currently in DB
  const users = await prisma.user.findMany({ select: { id: true } })
  const validUserIds = users.map(u => u.id)
  console.log("Valid users:", validUserIds)

  // Find campaigns whose brandId doesn't match any existing user
  const orphanCampaigns = await prisma.campaign.findMany({
    where: {
      brandId: { notIn: validUserIds }
    },
    select: { id: true, title: true, brandId: true }
  })
  console.log("Orphan campaigns to delete:", orphanCampaigns)

  if (orphanCampaigns.length === 0) {
    console.log("No orphan campaigns found")
    await prisma.$disconnect()
    return
  }

  // Delete related data first
  const orphanIds = orphanCampaigns.map(c => c.id)
  await prisma.campaignApplication.deleteMany({ where: { campaignId: { in: orphanIds } } })
  await prisma.campaignReview.deleteMany({ where: { campaignId: { in: orphanIds } } })
  await prisma.campaign.deleteMany({ where: { id: { in: orphanIds } } })

  console.log(`✅ Deleted ${orphanCampaigns.length} orphan campaigns`)
  await prisma.$disconnect()
}

cleanup().catch(console.error)
