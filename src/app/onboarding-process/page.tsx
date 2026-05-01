"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingProcessPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-body">
      <header className="px-6 lg:px-20 h-20 flex items-center justify-between border-b bg-white">
        <Logo />
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </Button>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 lg:p-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-foreground">Onboarding Process</h1>
            <p className="text-muted-foreground text-lg">A clear path to starting our bid management partnership.</p>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 space-y-12">
              <section className="space-y-6">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xl">1</div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Plan Selection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Choose the service tier that best fits your bidding requirements. We offer Essential, Professional, and Enterprise levels to suit different organizational scales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xl">2</div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Secure Subscription</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Complete your initial payment securely via Stripe. This establishes your dedicated account and allows us to begin resource provisioning immediately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xl">3</div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Workspace Automation</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Grant us permission to set up your dedicated Google Workspace. Our system automatically creates shared drives, project folders, and calendars specialized for your bid projects.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xl">4</div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Kick-off Call</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Once setup is complete, you'll meet your dedicated bid manager to review upcoming tenders and establish our collaborative workflow.
                    </p>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t flex flex-col items-center">
                <Button asChild size="lg" className="h-14 px-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
                  <Link href="/onboarding">Ready to Start? Begin Onboarding</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
