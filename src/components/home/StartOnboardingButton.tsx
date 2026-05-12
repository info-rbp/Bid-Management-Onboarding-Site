"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { buildInitialSubmission } from '@/lib/onboarding-submission';

export function StartOnboardingButton() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (isUserLoading) return;

    // 1. If not signed in: route to /auth
    if (!user) {
      router.push('/auth');
      return;
    }

    setLoading(true);

    try {
      // 2. Check for existing submission
      const q = query(
        collection(db, 'onboardingSubmissions'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Submission exists, either in_progress or submitted
        router.push('/dashboard');
        return;
      }

      // 3. Create new onboarding submission
      // Fetch user data for business name
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const newSubmissionId = doc(collection(db, 'onboardingSubmissions')).id;
      const newSubmission = {
        id: newSubmissionId,
        ...buildInitialSubmission({
          userId: user.uid,
          businessName: userData.businessName || 'My Business',
          currentStep: 'welcome_expectations',
        }),
      };

      await setDoc(
        doc(db, 'onboardingSubmissions', newSubmissionId),
        newSubmission
      );

      // 4. Sync the new onboarding submission to Google Sheets.
      // This is intentionally non-blocking for the user journey:
      // if the Sheet sync fails, the onboarding document still exists.
      try {
        const idToken = await user.getIdToken();

        const syncResponse = await fetch(
          '/api/onboarding-submissions/sync-sheet',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              submissionId: newSubmissionId,
            }),
          }
        );

        if (!syncResponse.ok) {
          const syncError = await syncResponse.json().catch(() => null);
          console.warn('Google Sheets sync did not complete:', syncError);
        }
      } catch (syncError) {
        console.warn(
          'Google Sheets sync failed, but onboarding was created:',
          syncError
        );
      }

      router.push('/onboarding/welcome_expectations');
    } catch (error) {
      console.error('Error initiating onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleClick}
      className="bg-primary text-white h-14 px-10 rounded-xl text-lg group shadow-lg shadow-primary/20"
      disabled={loading || isUserLoading}
    >
      {loading ? (
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
