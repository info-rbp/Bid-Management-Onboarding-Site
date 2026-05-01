"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRightCircle, Calendar, UploadCloud, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function NextStepsPage() {
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
            <h1 className="text-4xl font-headline font-bold text-foreground">Your Path Forward</h1>
            <p className="text-muted-foreground text-lg">What happens after you complete your onboarding.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-2xl p-6 space-y-4 bg-white">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">1. Bid Library Setup</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start uploading your core corporate documents to the new Shared Drive. This "Bid Library" will be the engine for all future tender responses.
              </p>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl p-6 space-y-4 bg-white">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">2. Strategy Session</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Meet with your assigned Bid Manager. We'll review your current tender pipeline, identify priority bids, and define our collaborative timeline.
              </p>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl p-6 space-y-4 bg-white">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">3. Active Bidding</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We hit the ground running. Our team begins drafting responses, tracking deadlines, and managing your submissions through the dashboard.
              </p>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-primary text-white">
            <CardContent className="p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-bold">Ready to take the first step?</h2>
                <p className="text-primary-foreground/80 max-w-md">
                  Join hundreds of organizations that have streamlined their bidding process with our strategic support.
                </p>
              </div>
              <Button asChild variant="secondary" size="lg" className="h-14 px-10 rounded-xl text-lg font-bold group">
                <Link href="/onboarding">
                  Start Onboarding <ArrowRightCircle className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
