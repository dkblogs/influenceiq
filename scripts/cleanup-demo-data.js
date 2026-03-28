const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanup() {
  // Delete 9 demo influencers with no userId
  const deletedInfluencers = await prisma.influencer.deleteMany({
    where: { userId: null }
  })
  console.log("Deleted demo influencers:", deletedInfluencers.count)

  // Delete applications for the 3 test campaigns first
  const testCampaigns = await prisma.campaign.findMany({
    where: { title: { in: ["food blogger in pune", "bookho ki yaad", "did"] } },
    select: { id: true }
  })
  const testCampaignIds = testCampaigns.map(c => c.id)
  if (testCampaignIds.length) {
    await prisma.campaignApplication.deleteMany({ where: { campaignId: { in: testCampaignIds } } })
  }

  // Delete 3 test campaigns
  const deletedCampaigns = await prisma.campaign.deleteMany({
    where: {
      title: { in: ["food blogger in pune", "bookho ki yaad", "did"] }
    }
  })
  console.log("Deleted test campaigns:", deletedCampaigns.count)

  // Delete Dev user (typo duplicate) and all related data
  const devUser = await prisma.user.findFirst({
    where: { email: "devendrakumaa52023@gmail.com" }
  })
  if (devUser) {
    await prisma.influencer.deleteMany({ where: { userId: devUser.id } })
    await prisma.session.deleteMany({ where: { userId: devUser.id } })
    await prisma.account.deleteMany({ where: { userId: devUser.id } })
    await prisma.notification.deleteMany({ where: { userId: devUser.id } })
    await prisma.creditTransaction.deleteMany({ where: { userId: devUser.id } })
    await prisma.user.delete({ where: { id: devUser.id } })
    console.log("Deleted duplicate Dev user")
  }

  console.log("Cleanup complete!")
  await prisma.$disconnect()
}

cleanup().catch(console.error)
