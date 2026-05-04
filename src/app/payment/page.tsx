'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  Lock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function PaymentPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: userData } = useDoc(userDocRef);

  const isActive = userData?.subscriptionStatus === 'active';

  const handleActivate = async () => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        subscriptionStatus: 'active',
        updatedAt: serverTimestamp(),
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error activating subscription: ', error);
      // You could add a toast notification here to inform the user of the error
    }
  };

  return (
    <AuthGuard requireSubscription={false}>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-body">
        <header className="px-6 h-20 flex items-center justify-between border-b bg-white">
          <Logo />

          <Button asChild variant="ghost" className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-3xl w-full space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/10">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Subscription Required
                </span>
              </div>

              <h1 className="text-4xl font-headline font-bold text-slate-900">
                Activate Your Bid Manager Account
              </h1>

              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                To activate your account, please agree to our terms and conditions.
                You will receive an invoice for your selected plan separately.
              </p>
            </div>

            {isActive ? (
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8 lg:p-10 space-y-6 text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Subscription Active
                    </h2>
                    <p className="text-slate-500">
                      Your account is active. You can continue to your dashboard.
                    </p>
                  </div>

                  <Button asChild className="h-12 px-8 rounded-xl font-bold">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-1 gap-8">
                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-primary">
                        Professional Plan
                      </h2>
                      <p className="text-3xl font-black">
                        $500 + GST
                        <span className="text-sm text-slate-400">
                          /mo (to be invoiced)
                        </span>
                      </p>
                    </div>

                    <ul className="space-y-4">
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Dedicated Bid Manager</span>
                      </li>

                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <Zap className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Full onboarding dashboard access</span>
                      </li>

                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <CreditCard className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Invoice-based billing</span>
                      </li>
                    </ul>

                    <div className="pt-4 space-y-3">
                      <Button
                        onClick={handleActivate}
                        className="w-full h-14 rounded-2xl text-lg font-bold"
                      >
                        Activate Now
                      </Button>

                      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                        By clicking 'Activate Now', you agree to our{' '}
                        <Link href="/terms" className="underline">
                          Terms and Conditions
                        </Link>
                        . An invoice will be sent to your registered email address.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
