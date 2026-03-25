interface RateLimitStore {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitStore>()

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = store.get(identifier)

  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1, resetIn: windowMs }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { success: true, remaining: limit - record.count, resetIn: record.resetTime - now }
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) store.delete(key)
  }
}, 5 * 60 * 1000)
