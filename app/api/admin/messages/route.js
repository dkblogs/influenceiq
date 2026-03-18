import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    })
    return Response.json({ messages })
  } catch (error) {
    console.error("Admin messages error:", error.message)
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json()
    await prisma.contactMessage.update({
      where: { id },
      data: { status: status ?? "read" },
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error("Admin messages PATCH error:", error.message)
    return Response.json({ error: "Failed to update message" }, { status: 500 })
  }
}
