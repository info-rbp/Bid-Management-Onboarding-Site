"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function DocumentRequirementsPage() {
  const requirements = [
    {
      category: "Corporate Information",
      items: ["Company Registration Documents", "VAT/Tax Certificates", "Organizational Chart", "Company Profile & Biography"]
    },
    {
      category: "Financial Documents",
      items: ["Last 3 Years Audited Financial Statements", "Proof of Insurance (Public/Professional Liability)", "Bank Reference Letter"]
    },
    {
      category: "Quality & Compliance",
      items: ["ISO Certificates (if applicable)", "Health & Safety Policy", "Environmental Policy", "Data Protection/GDPR Policy"]
    },
    {
      category: "Experience & References",
      items: ["Case Studies of Similar Projects", "Client Testimonials", "List of Completed Tenders", "Contact details for 3 professional references"]
    }
  ];

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
            <h1 className="text-4xl font-headline font-bold text-foreground">Document Requirements</h1>
            <p className="text-muted-foreground text-lg">Gather these documents to expedite your bid readiness.</p>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 space-y-8">
              <p className="text-muted-foreground leading-relaxed">
                To provide effective bid management, we need a standard set of "Bid Library" documents. Having these ready in digital format will allow us to respond to tenders with minimal delay.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {requirements.map((req, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                      <FileCheck className="w-5 h-5" /> {req.category}
                    </h3>
                    <ul className="space-y-2">
                      {req.items.map((item, i) => (
                        <li key={i} className="text-sm flex gap-2 items-start">
                          <span className="text-primary font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-accent/5 rounded-2xl border border-accent/20 mt-8">
                <h4 className="font-bold mb-2">Pro Tip:</h4>
                <p className="text-sm text-muted-foreground">
                  Our system will automatically create folders for each of these categories in your Shared Drive during onboarding. You'll be able to drag and drop these files directly into your new workspace.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
