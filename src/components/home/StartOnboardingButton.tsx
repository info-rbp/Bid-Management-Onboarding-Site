'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export function StartOnboardingButton() {
  const { user, isUserLoading, areServicesAvailable, initializationError } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!areServicesAvailable) {
      if (initializationError) {
        console.warn('StartOnboardingButton: Firebase unavailable, falling back to /auth.', initializationError);
      }
      router.push('/auth');
      return;
    }

    if (isUserLoading || loading) return;

    if (!user) {
      router.push('/auth?returnUrl=/onboarding/welcome_expectations');
      return;
    }

    setLoading(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/onboarding-submissions/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Unable to start onboarding.');
      router.push(result?.route || '/onboarding/welcome_expectations');
    } catch (error) {
      console.error('Error initiating onboarding:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleClick}
      className="bg-primary text-white h-14 px-10 rounded-xl text-lg group shadow-lg shadow-primary/20"
      disabled={loading || (areServicesAvailable && isUserLoading)}
    >
      {loading || (areServicesAvailable && isUserLoading) ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        <>
          Start Your Onboarding{' '}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </Button>
  );
}
