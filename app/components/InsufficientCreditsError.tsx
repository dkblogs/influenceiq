import Link from "next/link"

export default function InsufficientCreditsError({
  action,
  required,
  current,
  from,
}: {
  action?: string
  required?: number
  current?: number | null
  from?: string
}) {
  const href = from ? `/pricing?from=${encodeURIComponent(from)}` : "/pricing"
  return (
    <div className="flex items-center gap-2 text-sm text-red-400">
      <span>
        {required != null && current != null
          ? `Needs ${required} credits to ${action ?? "do this"}. You have ${current}.`
          : `Not enough credits${action ? ` to ${action}` : ""}.`}
      </span>
      <Link href={href} className="text-purple-400 underline hover:text-purple-300 font-medium whitespace-nowrap">
        Buy credits →
      </Link>
    </div>
  )
}
