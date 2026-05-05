"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export default function OnboardingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first step of the actual onboarding process
    router.replace('/onboarding/welcome_expectations');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="mb-8">
            <Logo />
        </div>
        <div className="flex items-center justify-center gap-4 p-8 rounded-2xl bg-white shadow-2xl">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
            <p className="text-lg font-medium text-muted-foreground">Please wait, preparing your onboarding...</p>
        </div>
    </div>
  );
}
