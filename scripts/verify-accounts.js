const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verify() {
  const users = await prisma.user.findMany({
    include: {
      influencers: {
        select: {
          id: true,
          name: true,
          niche: true,
          platform: true,
          instagramHandle: true,
          youtubeHandle: true,
          instagramVerified: true,
          youtubeVerified: true,
          verified: true,
          aiScore: true,
          phone: true,
          location: true,
          about: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  users.forEach(u => {
    console.log(`\n--- ${u.role.toUpperCase()} ---`)
    console.log(`Name: ${u.name}`)
    console.log(`Email: ${u.email}`)
    console.log(`Credits: ${u.credits}`)
    const inf = u.influencers?.[0]
    if (inf) {
      console.log(`Influencer profile:`)
      console.log(`  Niche: ${inf.niche}`)
      console.log(`  Platform: ${inf.platform}`)
      console.log(`  Instagram: ${inf.instagramHandle} (verified: ${inf.instagramVerified})`)
      console.log(`  YouTube: ${inf.youtubeHandle} (verified: ${inf.youtubeVerified})`)
      console.log(`  IIQ Verified: ${inf.verified}`)
      console.log(`  AI Score: ${inf.aiScore}`)
      console.log(`  Phone: ${inf.phone}`)
      console.log(`  Location: ${inf.location}`)
    }
  })

  await prisma.$disconnect()
}

verify().catch(console.error)
