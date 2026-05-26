"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
            <h1 className="text-4xl font-headline font-bold text-foreground">Terms and Conditions</h1>
            <p className="text-muted-foreground">Last Updated: May 26, 2026</p>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 prose prose-slate max-w-none">
              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Bid Manager. These terms govern your use of this onboarding
                  application and the related bid-management services provided by
                  Remote Business Partner.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">2. Service scope</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This application is used to collect onboarding details, supporting
                  documents, workflow preferences and authority rules so the service
                  team can review your setup and prepare related bid-management
                  materials.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">3. Accuracy and authority</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for ensuring the information submitted through
                  the onboarding application is accurate and that you are authorized
                  to provide it on behalf of the business.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">4. Documents and platform use</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Uploaded documents and stated authority settings are used to support
                  onboarding review and related operational setup. Submitted content
                  may be stored in secure internal systems used to coordinate service
                  delivery.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">5. Submission review</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Submitted onboarding packs may be reviewed, clarified or reopened if
                  required to correct errors, resolve missing information or confirm
                  approval settings.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">6. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions regarding these terms, please contact
                  {' '}<a href="mailto:info@remotebusinesspartner.com.au">info@remotebusinesspartner.com.au</a>.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="px-6 py-8 border-t bg-white mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo className="opacity-50 grayscale" />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Bid Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}