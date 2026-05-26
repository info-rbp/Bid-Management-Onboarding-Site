"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
            <h1 className="text-4xl font-headline font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: May 26, 2026</p>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 prose prose-slate max-w-none">
              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">1. What we collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We collect the information you provide during account creation and
                  onboarding, including contact details, business information,
                  uploaded documents, approval contacts, workflow preferences and
                  related operational data.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">2. How we use your information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use your information to deliver bid-management onboarding,
                  prepare proposal and compliance materials, coordinate follow-up
                  actions, and manage the operational systems that support your
                  service.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">3. Systems and service providers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This application uses Firebase for authentication, database and
                  file storage, and may use Google Workspace services such as
                  Google Drive and Google Sheets to support onboarding operations.
                  Email notifications may also be used for internal operational
                  follow-up.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">4. Access and authority</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information is intended to be accessible only to your
                  authorized user account and approved internal administrators
                  responsible for onboarding and service delivery.
                </p>
              </section>

              <section className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold">5. Retention and updates</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain onboarding information for operational and record-keeping
                  purposes. If details change or submitted information needs
                  correction, contact the service team so the appropriate update
                  path can be arranged.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">6. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For privacy-related questions, please contact
                  {' '}<a href="mailto:info@remotebusinesspartner.com.au">info@remotebusinesspartner.com.au</a>.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}