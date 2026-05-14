"use client";

import React, { useEffect, useState } from 'react';
import { useUser, useOptionalAuth, useOptionalFirestore } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { AlertTriangle, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthGuardProps {
  children: React.ReactNode;
}

type RepairError = {
  message: string;
  detail?: string;
};

/**
 * AuthGuard ensures the user is authenticated and has a profile record.
 * Subscription gating has been disabled as per user request.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const auth = useOptionalAuth();
  const { user, isUserLoading, areServicesAvailable, initializationError } = useUser();
  const db = useOptionalFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const [isVerifying, setIsVerifying] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [repairError, setRepairError] = useState<RepairError | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      if (isUserLoading) return;

      setIsVerifying(true);
      setRepairError(null);

      if (!user) {
        if (pathname !== '/auth') {
          router.push(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
        }

        if (isMounted) {
          setProfile(null);
          setIsVerifying(false);
        }

        return;
      }

      if (!db) {
        if (isMounted) {
          setRepairError({
            message: 'Unable to verify your profile.',
            detail: 'The database connection is not available.',
          });
          setProfile(null);
          setIsVerifying(false);
        }

        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let currentProfile;

        if (!userSnap.exists()) {
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

          await setDoc(userRef, currentProfile, { merge: true });
        } else {
          currentProfile = userSnap.data();
        }

        if (isMounted) {
          setProfile(currentProfile);
          setRepairError(null);
        }
      } catch (error: any) {
        console.error('AuthGuard profile verification/repair error:', error);

        if (isMounted) {
          setProfile(null);
          setRepairError({
            message: 'Unable to prepare your secure profile.',
            detail:
              error?.message ||
              'Profile verification failed. Retry or sign out and sign in again.',
          });
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [user, isUserLoading, db, router, pathname, retryNonce]);

  const handleRetry = () => {
    setRepairError(null);
    setIsVerifying(true);
    setRetryNonce((value) => value + 1);
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/auth');
  };


  if (!areServicesAvailable) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-6">
        <Card className="w-full max-w-lg border-none shadow-xl rounded-3xl">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <CardTitle>Authentication temporarily unavailable</CardTitle>
            <CardDescription>
              The application could not load the Firebase client configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {initializationError?.message && (
              <div className="rounded-2xl bg-slate-50 border p-4 text-sm text-slate-600 break-words">
                {initializationError.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => window.location.reload()} className="gap-2 rounded-xl">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/')} className="rounded-xl">
                Return home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (isUserLoading || isVerifying) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">
          Verifying secure access...
        </p>
      </div>
    );
  }

  if (!user && pathname !== '/auth') return null;

  if (user && repairError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-6">
        <Card className="w-full max-w-lg border-none shadow-xl rounded-3xl">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <CardTitle>Profile repair needed</CardTitle>
            <CardDescription>
              We could not verify or repair your profile record automatically.
              Retry the repair, or sign out and sign back in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 border p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{repairError.message}</p>
              {repairError.detail && (
                <p className="mt-1 break-words">{repairError.detail}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRetry} className="gap-2 rounded-xl">
                <RefreshCw className="w-4 h-4" />
                Retry profile repair
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSignOut}
                className="gap-2 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
