// TODO: swap this in-memory store for Upstash Redis before production
// (in-memory resets on every cold start and is not shared across serverless instances)

type Entry = { count: number; resetAt: number };

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_STORE_SIZE = 5000;

function checkLimit(store: Map<string, Entry>, key: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now();

  if (store.size > MAX_STORE_SIZE) {
    for (const [k, entry] of store) {
      if (now > entry.resetAt) store.delete(k);
    }
  }

  if (store.size > MAX_STORE_SIZE) {
    for (const [k] of store) {
      store.delete(k);
      if (store.size <= MAX_STORE_SIZE) break;
    }
  }

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

const ipStore = new Map<string, Entry>();
const IP_LIMIT = 3;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  return checkLimit(ipStore, ip, IP_LIMIT);
}

// Tune based on usage data
const USER_DAILY_LIMIT = 5;
const userStore = new Map<string, Entry>();

export function checkUserRateLimit(userId: string): { allowed: boolean; remaining: number } {
  return checkLimit(userStore, userId, USER_DAILY_LIMIT);
}

// Free tier limit. When monetising, gate above this behind Stripe.
// Do not remove this limit silently — users on the free tier should still get 3.
export const TAILORED_CV_MONTHLY_LIMIT = 3;
const monthlyUserStore = new Map<string, Entry>();

function getMonthResetAt(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}

export function checkMonthlyUserRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetDate: string;
} {
  const now = Date.now();
  const resetAt = getMonthResetAt();
  const resetDate = new Date(resetAt).toISOString().split('T')[0];

  if (monthlyUserStore.size > 5000) {
    for (const [k, entry] of monthlyUserStore) {
      if (now > entry.resetAt) monthlyUserStore.delete(k);
    }
  }

  const entry = monthlyUserStore.get(userId);

  if (!entry || now > entry.resetAt) {
    monthlyUserStore.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: TAILORED_CV_MONTHLY_LIMIT - 1, resetDate };
  }

  if (entry.count >= TAILORED_CV_MONTHLY_LIMIT) {
    return { allowed: false, remaining: 0, resetDate };
  }

  entry.count++;
  return { allowed: true, remaining: TAILORED_CV_MONTHLY_LIMIT - entry.count, resetDate };
}

export function getMonthlyUsage(userId: string): { used: number; remaining: number; resetDate: string } {
  const now = Date.now();
  const resetDate = new Date(getMonthResetAt()).toISOString().split('T')[0];
  const entry = monthlyUserStore.get(userId);
  if (!entry || now > entry.resetAt) {
    return { used: 0, remaining: TAILORED_CV_MONTHLY_LIMIT, resetDate };
  }
  return { used: entry.count, remaining: TAILORED_CV_MONTHLY_LIMIT - entry.count, resetDate };
}