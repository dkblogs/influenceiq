const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fix() {
  // Fix dk's placeholder phone number - remove it so it shows as genuinely empty
  const dk = await prisma.influencer.findFirst({
    where: { instagramHandle: "@_devkumar_" }
  })
  if (dk) {
    await prisma.influencer.update({
      where: { id: dk.id },
      data: { phone: null }
    })
    console.log("Fixed dk - removed placeholder phone")
  }

  // Fix setu - update niche from "Other" to something more accurate
  // We'll leave niche for setu to update herself from profile page
  // Just confirm her account looks correct
  const setu = await prisma.influencer.findFirst({
    where: { instagramHandle: "@deadp0p" }
  })
  console.log("Setu profile:", setu?.niche, setu?.platform)

  console.log("Done!")
  await prisma.$disconnect()
}

fix().catch(console.error)
