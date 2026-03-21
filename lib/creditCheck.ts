export function hasEnoughCredits(credits: number | null, required: number): boolean {
  return credits !== null && credits >= required
}

export function insufficientCreditsMessage(credits: number | null, required: number, action: string) {
  return `You need ${required} credits to ${action}. You have ${credits ?? 0}. `
}
