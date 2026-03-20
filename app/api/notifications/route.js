import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return Response.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Notifications GET error:", error.message)
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
      return Response.json({ success: true })
    }

    if (body.id) {
      await prisma.notification.updateMany({
        where: { id: body.id, userId: session.user.id },
        data: { read: true },
      })
      return Response.json({ success: true })
    }

    return Response.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Notifications PATCH error:", error.message)
    return Response.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
