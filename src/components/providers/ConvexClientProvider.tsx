"use client";

import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
  context: {
    headers: {
      'Convex-Client': 'nextjs-clerk-1.0.0',
    },
  },
});

// Component to handle user sync with Convex
const ConvexUserSync = () => {
  const { user, isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const getUser = useQuery(api.users.getUser, user?.id ? { userId: user.id } : 'skip');

  useEffect(() => {
    if (isSignedIn && user) {
      console.log('🔵 Syncing user with Convex...', {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.username
      });

      syncUser({
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.username || 'Anonymous',
      })
        .then(result => {
          console.log('✅ User synced with Convex:', result);
        })
        .catch(error => {
          console.error('🔴 Error syncing user with Convex:', error);
        });
    }
  }, [isSignedIn, user, syncUser]);

  // Debug logs
  useEffect(() => {
    console.log('🔄 User sync status:', {
      isSignedIn,
      user: user ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName
      } : null,
      userInConvex: getUser
    });
  }, [isSignedIn, user, getUser]);

  return null;
};

export default function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ConvexUserSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}