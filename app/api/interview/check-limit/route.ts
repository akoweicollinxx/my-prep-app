import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkAndRecordWeeklyInterview, BILLING_CUTOFF_DATE } from '@/lib/rate-limit';
import { track } from '@/lib/track';

export const runtime = 'nodejs';

export type InterviewLimitResponse =
  | { allowed: true; tier: 'pro' | 'legacy_free' | 'free' }
  | { allowed: false; tier: 'free' };

export async function POST(): Promise<NextResponse<InterviewLimitResponse | { error: string }>> {
  const { userId, has } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const planId = process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID;

  // 1. Pro subscription check
  if (planId) {
    const isPro = has({ plan: `user:${planId}` as `user:${string}` });
    if (isPro) {
      return NextResponse.json({ allowed: true, tier: 'pro' });
    }
  }

  // 2. Legacy-free grandfathering — users who signed up before billing launched
  const cutoffTs = BILLING_CUTOFF_DATE.getTime();
  if (!isNaN(cutoffTs)) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      if (user.createdAt < cutoffTs) {
        return NextResponse.json({ allowed: true, tier: 'legacy_free' });
      }
    } catch {
      // If Clerk API fails, fall through to the free-tier check rather than blocking
    }
  }

  // 3. Free tier — weekly cap. Slot is consumed here; if vapi fails the slot is still spent.
  const { allowed } = checkAndRecordWeeklyInterview(userId);

  if (!allowed) {
    track('interview_limit_hit', { tier: 'free', userId });
    return NextResponse.json({ allowed: false, tier: 'free' });
  }

  return NextResponse.json({ allowed: true, tier: 'free' });
}
