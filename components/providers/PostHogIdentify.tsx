'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';

export function PostHogIdentify() {
  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress ?? undefined,
        name: user.fullName ?? undefined,
      });
    } else {
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
