// Simple in-memory rate limiter per IP
const requests = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const limit = 20; // 20 uploads/clips per 10 min window

  if (requests.size > 1000) {
    requests.forEach((value, key) => {
      if (now > value.reset) {
        requests.delete(key);
      }
    });
  }

  const entry = requests.get(ip);
  if (!entry || now > entry.reset) {
    requests.set(ip, { count: 1, reset: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}
