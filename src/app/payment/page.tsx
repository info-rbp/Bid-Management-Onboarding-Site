"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function PaymentPage() {
  const { user } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);

  const { data: userData } = useDoc(userDocRef);

  const isActive = userData?.subscriptionStatus === "active";

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
                Your onboarding dashboard is protected until your subscription is active.
                Stripe Checkout integration is pending, so subscription activation must
                currently be completed manually by Bid Manager.
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
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-primary">
                        Professional Plan
                      </h2>
                      <p className="text-3xl font-black">
                        $999
                        <span className="text-sm text-slate-400">/mo</span>
                      </p>
                    </div>

                    <ul className="space-y-4">
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Dedicated Bid Manager</span>
                      </li>

                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <Zap className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Full onboarding dashboard access after activation</span>
                      </li>

                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <CreditCard className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Stripe Checkout integration planned</span>
                      </li>
                    </ul>

                    <div className="pt-4 space-y-3">
                      <Button disabled className="w-full h-14 rounded-2xl text-lg font-bold">
                        Stripe Checkout Coming Soon
                      </Button>

                      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                        This button no longer activates subscriptions from frontend code.
                        Activation must be handled manually or by a future verified Stripe webhook.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-none bg-blue-50/70 rounded-3xl p-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                        <Mail className="w-6 h-6" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold">Manual activation</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Contact Bid Manager to activate your subscription while Stripe
                          Checkout is being connected.
                        </p>

                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                          <Link href="mailto:support@bidmanager.com">
                            Contact Support
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-none bg-green-50/70 rounded-3xl p-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-600 shrink-0">
                        <RefreshCw className="w-6 h-6" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold">Already activated?</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          If your subscription has been manually activated, refresh this
                          page or return to your dashboard.
                        </p>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => window.location.reload()}
                          >
                            Refresh Status
                          </Button>

                          <Button asChild size="sm" className="rounded-xl">
                            <Link href="/dashboard">Dashboard</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
