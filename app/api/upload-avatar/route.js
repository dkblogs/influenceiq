import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
import { getInfluencerForUser } from "@/lib/getInfluencerForUser"

const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const BUCKET = "avatars"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("1. Auth check - userId:", session?.user?.id)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()

    // Handle "use Instagram photo" — just a URL, no file upload
    const instagramUrl = formData.get("instagramUrl")
    if (instagramUrl) {
      const influencer = await getInfluencerForUser({
        userId: session.user.id,
        email: session.user.email,
      })
      if (!influencer) return Response.json({ error: "Influencer not found" }, { status: 404 })
      await prisma.influencer.update({
        where: { id: influencer.id },
        data: { profileImage: instagramUrl },
      })
      return Response.json({ url: instagramUrl })
    }

    const file = formData.get("file")
    console.log("2. File received:", file?.name, file?.size, file?.type)
    if (!file || typeof file === "string") {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: "Only JPG, PNG and WebP images are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    if (bytes.byteLength > MAX_SIZE) {
      return Response.json({ error: "File must be under 2MB" }, { status: 400 })
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
    const filename = `${session.user.id}-${Date.now()}.${ext}`

    console.log("3. Uploading to Supabase bucket: avatars, filename:", filename)
    const uploadResult = await supabase.storage
      .from(BUCKET)
      .upload(filename, bytes, { contentType: file.type, upsert: true })
    console.log("4. Supabase upload result:", JSON.stringify(uploadResult))
    console.log("5. Supabase error:", JSON.stringify(uploadResult.error))

    const uploadError = uploadResult.error
    if (uploadError) {
      console.error("Supabase upload error:", uploadError.message)
      return Response.json({ error: "Upload failed" }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    const publicUrl = urlData.publicUrl
    console.log("6. Public URL:", publicUrl)

    const influencer = await getInfluencerForUser({
      userId: session.user.id,
      email: session.user.email,
    })
    if (!influencer) return Response.json({ error: "Influencer not found" }, { status: 404 })

    await prisma.influencer.update({
      where: { id: influencer.id },
      data: { profileImage: publicUrl },
    })

    return Response.json({ url: publicUrl })
  } catch (error) {
    console.error("Upload avatar error:", error.message)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
