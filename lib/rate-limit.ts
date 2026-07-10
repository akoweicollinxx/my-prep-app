// Payment processor: Stripe (via Clerk Billing).
// VAT handling: Stripe Tax is enabled in the Stripe dashboard.
// EU/UK VAT is calculated automatically per customer location.
// For OSS quarterly filing, download tax reports from Stripe Tax → Reports.
// If Stripe Tax is ever disabled, VAT compliance becomes manual — do not disable without a plan.

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

// ─────────────────────────────────────────────────────────────────────────────
// MOCK INTERVIEW WEEKLY LIMIT (billing gate — free tier only)
// ─────────────────────────────────────────────────────────────────────────────

// BILLING_CUTOFF_DATE — SET THIS TO YOUR EXACT LAUNCH DATE BEFORE DEPLOYING
//
// Users who signed up BEFORE this date are "legacy_free" and retain unlimited
// mock interviews regardless of subscription status.
//
// CRITICAL — getting this wrong:
//   Too early  (before any real users existed): nobody qualifies as legacy_free.
//              Existing users get 1 interview/week like new free users. Bad UX.
//   Too late   (still in the future on deploy): every signup until that date gets
//              unlimited interviews = free Pro tier. KILLS conversion. CRITICAL BUG.
//   Not set    (invalid date, as below): isNaN check fires, no grandfathering,
//              all free users get 1/week. Safest failure mode for launch.
//
// Set to the date you actually enable billing in production, e.g.:
//   export const BILLING_CUTOFF_DATE = new Date('2026-07-15T00:00:00Z');
export const BILLING_CUTOFF_DATE = new Date('TODO_SET_ON_DEPLOY');

if (typeof process !== 'undefined') {
  const ts = BILLING_CUTOFF_DATE.getTime();
  if (isNaN(ts)) {
    console.warn(
      '[NextEmployed] BILLING_CUTOFF_DATE is not set. ' +
      'Legacy-free grandfathering is disabled — set this before launch.'
    );
  } else if (ts > Date.now()) {
    console.error(
      '[NextEmployed] BILLING_CUTOFF_DATE is in the FUTURE. ' +
      'All new signups will get unlimited interviews until that date. Fix before launch!'
    );
  }
}

const INTERVIEW_FREE_WEEKLY_LIMIT = 1;
const weeklyInterviewStore = new Map<string, Entry>();

function getWeekResetAt(): number {
  const now = new Date();
  // ISO week starts Monday. getUTCDay(): 0=Sun,1=Mon,...,6=Sat
  const daysFromMonday = (now.getUTCDay() + 6) % 7;
  const weekStart = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysFromMonday,
  );
  return weekStart + 7 * 24 * 60 * 60 * 1000; // next Monday 00:00:00 UTC
}

// Records one interview attempt and returns whether it was within the free limit.
// Call this BEFORE vapi.start() — if vapi fails afterward the slot is still consumed.
export function checkAndRecordWeeklyInterview(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const resetAt = getWeekResetAt();

  if (weeklyInterviewStore.size > MAX_STORE_SIZE) {
    for (const [k, entry] of weeklyInterviewStore) {
      if (now > entry.resetAt) weeklyInterviewStore.delete(k);
    }
  }

  const entry = weeklyInterviewStore.get(userId);

  if (!entry || now > entry.resetAt) {
    weeklyInterviewStore.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: INTERVIEW_FREE_WEEKLY_LIMIT - 1 };
  }

  if (entry.count >= INTERVIEW_FREE_WEEKLY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: INTERVIEW_FREE_WEEKLY_LIMIT - entry.count };
}

// Peek at usage without consuming a slot (used for UI state, not enforcement).
export function peekWeeklyInterviewUsage(userId: string): { used: number; resetDate: string } {
  const now = Date.now();
  const entry = weeklyInterviewStore.get(userId);
  const resetDate = new Date(getWeekResetAt()).toISOString().split('T')[0];
  if (!entry || now > entry.resetAt) return { used: 0, resetDate };
  return { used: entry.count, resetDate };
}
