import Link from "next/link"

export default function InsufficientCreditsError({ action }: { action?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-400">
      <span>Not enough credits{action ? ` to ${action}` : ""}.</span>
      <Link href="/pricing" className="text-purple-400 underline hover:text-purple-300 font-medium">
        Buy credits →
      </Link>
    </div>
  )
}
