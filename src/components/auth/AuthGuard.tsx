"use client";

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard ensures the user is authenticated and has a profile record.
 * Subscription gating has been disabled as per user request.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function verifyAccess() {
      if (isUserLoading) return;

      // 1. Check if authenticated
      if (!user) {
        // Exclude /auth from redirecting to itself
        if (pathname !== '/auth') {
          router.push(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
        }
        setIsVerifying(false);
        return;
      }

      try {
        // 2. Fetch or Repair Profile
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let currentProfile;
        if (!userSnap.exists()) {
          // Repair profile if missing
          currentProfile = {
            id: user.uid,
            email: user.email,
            fullName: user.displayName || 'Client User',
            businessName: 'Business Name Pending',
            role: 'client',
            subscriptionStatus: 'active',
            onboardingStatus: 'not_started',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, currentProfile);
        } else {
          currentProfile = userSnap.data();
        }
        setProfile(currentProfile);

      } catch (error) {
        console.error("AuthGuard Verification Error:", error);
      } finally {
        setIsVerifying(false);
      }
    }

    verifyAccess();
  }, [user, isUserLoading, db, router, pathname]);

  if (isUserLoading || isVerifying) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">Verifying secure access...</p>
      </div>
    );
  }

  // Final check to prevent flashing content if we are about to redirect
  if (!user && pathname !== '/auth') return null;

  return <>{children}</>;
}
