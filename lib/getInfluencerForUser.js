import { prisma } from "./prisma"

/**
 * Find the Influencer row linked to a user.
 * First tries userId match; falls back to email match and auto-links the row.
 */
export async function getInfluencerForUser({ userId, email }) {
  let influencer = await prisma.influencer.findFirst({
    where: { userId },
  })

  if (!influencer && email) {
    influencer = await prisma.influencer.findFirst({
      where: { email },
    })
    if (influencer) {
      // One-time auto-link: write userId so future lookups hit the fast path
      influencer = await prisma.influencer.update({
        where: { id: influencer.id },
        data: { userId },
      })
    }
  }

  return influencer
}
