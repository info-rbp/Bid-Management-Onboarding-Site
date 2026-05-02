"use client";

import React, { useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { CreditCard, ShieldCheck, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function PaymentPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // MOCK PAYMENT HANDLER - In a real app, this would use Stripe Elements or a redirect
  const handleMockPayment = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        subscriptionStatus: 'active',
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Payment Successful",
        description: "Your subscription is now active. Redirecting to your dashboard..."
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not activate subscription."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requireSubscription={false}>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-body">
        <header className="px-6 h-20 flex items-center justify-center border-b bg-white">
          <Logo />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-2xl w-full space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-headline font-bold text-slate-900">Activate Your Account</h1>
              <p className="text-slate-500 text-lg">Complete your subscription to unlock the onboarding portal and dashboard.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-primary">Professional Plan</h2>
                    <p className="text-3xl font-black">$999<span className="text-sm text-slate-400">/mo</span></p>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-slate-600">
                      <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Dedicated Bid Manager</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-600">
                      <Zap className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Full Workspace Automation</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-600">
                      <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Unlimited Library Storage</span>
                    </li>
                  </ul>

                  <div className="pt-4">
                    <Button onClick={handleMockPayment} className="w-full h-14 rounded-2xl text-lg font-bold group" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : (
                        <>Pay Securely with Stripe <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center mt-4 uppercase font-bold tracking-widest">
                      Secure payment processed via Stripe
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-none bg-blue-50/50 rounded-3xl p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold">No hidden fees</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Cancel anytime. Your data belongs to you and will be available for export if you choose to leave.</p>
                    </div>
                  </div>
                </Card>

                <Card className="border-none bg-green-50/50 rounded-3xl p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-600 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold">Enterprise-grade security</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">We use 256-bit encryption and strict Google Workspace permission protocols to protect your IP.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
