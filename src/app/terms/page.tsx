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
            <p className="text-muted-foreground">Last Updated: October 20, 2023</p>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 prose prose-slate max-w-none">
              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Bid Manager. These Terms and Conditions govern your use of our website and services provided by Remote Business Partner. By accessing our services, you agree to be bound by these terms.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">2. Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Bid Manager provides strategic bid management support, including document preparation, deadline tracking, and workspace automation. Services are delivered based on the selected subscription tier.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">3. Subscription and Payments</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Subscribers agree to pay the monthly fees associated with their chosen plan. Payments are processed securely via Stripe. Failure to maintain a valid payment method may result in service interruption.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">4. Data and Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your business data is handled with strict confidentiality. We use Google Workspace for collaboration, and access is managed via your authorized Google account.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">5. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may cancel your subscription at any time. Upon termination, access to the Bid Manager dashboard and dedicated support will be phased out according to your billing cycle.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">6. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions regarding these terms, please contact us at support@bidmanager.com.
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
