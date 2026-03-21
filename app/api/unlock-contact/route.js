export async function POST() {
  return Response.json(
    { error: "Contact unlocking via credits has been discontinued. Send a proposal to connect with influencers." },
    { status: 410 }
  )
}
