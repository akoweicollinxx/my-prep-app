'use client';

import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { track } from '@/lib/track';

export function UserNav() {
  const { isSignedIn, isLoaded, has } = useAuth();

  if (!isLoaded || !isSignedIn) return null;

  const planId = process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID ?? '';
  const isPro = planId ? has({ plan: `user:${planId}` as `user:${string}` }) : false;

  return (
    <div className="flex items-center gap-3">
      {isPro ? (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 text-purple-300 select-none">
          Pro
        </span>
      ) : (
        <Link
          href="/pricing"
          onClick={() => track('pricing_upgrade_clicked', { source: 'nav' })}
          className="text-xs font-medium text-gray-400 hover:text-white transition-colors whitespace-nowrap"
        >
          Upgrade to Pro
        </Link>
      )}
      <UserButton />
    </div>
  );
}
