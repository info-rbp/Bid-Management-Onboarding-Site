
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getVisibleOnboardingSteps } from '@/lib/onboarding-steps';

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
      // 2. Check user profile for subscription status
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists() || userSnap.data().subscriptionStatus !== 'active') {
        router.push('/payment');
        return;
      }

      const userData = userSnap.data();

      // 3. Check for existing submission
      const q = query(collection(db, 'onboardingSubmissions'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Submission exists (either in_progress or submitted)
        router.push('/dashboard');
        return;
      }

      // 4. Create new onboarding submission
      const newSubmissionId = doc(collection(db, 'onboardingSubmissions')).id;
      const initialVisibleSteps = getVisibleOnboardingSteps([]); // Default steps when no services selected
      
      const newSubmission = {
        id: newSubmissionId,
        userId: user.uid,
        businessName: userData.businessName || 'My Business',
        status: 'in_progress',
        currentStep: 'welcome_expectations',
        completedSteps: [],
        sections: {},
        enabledModules: {
          tenderReadiness: false,
          grants: false,
          marketplaceStrategy: false,
          directOutreachStrategy: false,
          quoteSupport: false
        },
        visibleStepKeys: initialVisibleSteps.map(s => s.key),
        completionPercentage: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'onboardingSubmissions', newSubmissionId), newSubmission);
      
      router.push('/onboarding/welcome_expectations');
    } catch (error) {
      console.error("Error initiating onboarding:", error);
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
          Start Your Onboarding <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </Button>
  );
}
