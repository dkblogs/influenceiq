import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const influencers = await prisma.influencer.findMany({
      orderBy: { score: "desc" },
    })
    return Response.json({ influencers })
  } catch (error) {
    console.error("Admin influencers error:", error.message)
    return Response.json({ error: "Failed to fetch influencers" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, verified } = body
    await prisma.influencer.update({
      where: { id },
      data: { verified },
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error("Admin update error:", error.message)
    return Response.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const { id } = body
    await prisma.influencer.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error("Admin delete error:", error.message)
    return Response.json({ error: "Failed to delete" }, { status: 500 })
  }
}