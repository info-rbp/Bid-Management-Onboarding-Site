"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FolderCheck,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const nextSteps = [
  {
    number: '1',
    icon: ClipboardCheck,
    title: 'Bid Manager reviews your onboarding',
    description:
      'We review your submitted responses, selected services, service modules, document status, workflow rules and authority settings. This helps us understand what support you need and what we are authorised to do.',
  },
  {
    number: '2',
    icon: FileSearch,
    title: 'We identify gaps and follow-up items',
    description:
      'We check for missing documents, unclear approval rules, compliance gaps, pricing gaps and any conflicts between your preferences and authority settings. If anything needs clarification, we will contact the nominated person.',
  },
  {
    number: '3',
    icon: FolderCheck,
    title: 'Your setup materials are prepared',
    description:
      'Depending on your selected services, we may prepare a profile summary, document checklist, authority matrix, compliance snapshot, opportunity-readiness notes and recommended setup actions.',
  },
  {
    number: '4',
    icon: MessageSquareText,
    title: 'We confirm priorities and ways of working',
    description:
      'Once the review is complete, we confirm the best next actions with you. This may include agreeing priority opportunity types, document follow-ups, approval contacts, submission rules and platform access requirements.',
  },
];

const reviewAreas = [
  'Business profile, services and offers',
  'Team capability, proof and past performance evidence',
  'Tender, grant, marketplace, proposal or quote support needs',
  'Insurance, licences, policies and compliance readiness',
  'Pricing, quoting and commercial approval rules',
  'Workflow contacts, review process and authority settings',
  'Documents received, missing, not applicable or needing help',
];

const clientActions = [
  {
    icon: Mail,
    title: 'Watch for follow-up emails',
    description:
      'If we need clarification or additional information, we will contact the relevant person listed in your onboarding responses.',
  },
  {
    icon: FolderCheck,
    title: 'Provide outstanding documents',
    description:
      'If you marked documents as will provide later, send or upload them when available so your bid library can be completed.',
  },
  {
    icon: ShieldCheck,
    title: 'Confirm approval rules',
    description:
      'Make sure the right people are available to approve pricing, platform actions, submissions and urgent opportunity responses.',
  },
];

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

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 lg:p-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/10">
              <CalendarCheck className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                After submission
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-headline font-bold text-foreground">
                Next Steps
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                After you submit your onboarding, Bid Manager reviews the information,
                checks for document and authority gaps, and prepares the next actions
                needed to get your support properly set up.
              </p>
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 space-y-12">
              <section className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">What happens next</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your submitted onboarding becomes the starting point for our review.
                    The goal is to turn your responses into practical setup actions,
                    not just admire a completed form like it is a rare museum object.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {nextSteps.map((step) => {
                    const Icon = step.icon;

                    return (
                      <Card
                        key={step.number}
                        className="border border-slate-200 shadow-none rounded-2xl bg-white"
                      >
                        <CardContent className="p-6 space-y-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xl">
                              {step.number}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-xl">{step.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section className="pt-8 border-t grid lg:grid-cols-2 gap-8">
                <Card className="border border-primary/10 shadow-none rounded-2xl bg-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      What Bid Manager reviews
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We review the full onboarding pack, with particular attention to
                      readiness, risk, missing documents and who can approve what.
                    </p>

                    <ul className="space-y-3">
                      {reviewAreas.map((area) => (
                        <li key={area} className="flex gap-3 text-sm leading-relaxed">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-accent/20 shadow-none rounded-2xl bg-white">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      What may happen before work starts
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      If your onboarding shows missing documents, unclear authority,
                      conflicting approval rules or incomplete service information, we may
                      need to resolve those items before acting on opportunities.
                    </p>

                    <div className="rounded-2xl bg-accent/5 border border-accent/20 p-5">
                      <h3 className="font-bold mb-2">Common follow-ups</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We may ask for updated insurance, licences, policies, project
                        examples, pricing guidance, platform access details or written
                        approval rules. Dull, yes. Useful, tragically also yes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="pt-8 border-t space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">What you may need to do</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    After submission, your main job is to respond to any follow-up
                    requests and provide any outstanding information marked during
                    onboarding.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {clientActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <Card
                        key={action.title}
                        className="border border-slate-200 shadow-none rounded-2xl bg-white"
                      >
                        <CardContent className="p-6 space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-bold text-lg">{action.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section className="pt-8 border-t">
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-primary text-white">
                  <CardContent className="p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                      <h2 className="text-3xl font-bold">Ready to complete onboarding?</h2>
                      <p className="text-primary-foreground/80 max-w-xl leading-relaxed">
                        Start the onboarding form, provide what you can, upload available
                        documents and clearly flag anything that needs follow-up. That
                        gives Bid Manager a clean starting point for review.
                      </p>
                    </div>

                    <Button
                      asChild
                      variant="secondary"
                      size="lg"
                      className="h-14 px-10 rounded-xl text-lg font-bold group shrink-0"
                    >
                      <Link href="/onboarding">
                        Start Onboarding
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}