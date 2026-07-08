'use client';

import { useAuth, UserButton } from '@clerk/nextjs';

export function UserNav() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || !isSignedIn) return null;
  return <UserButton />;
}
