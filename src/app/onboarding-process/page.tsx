"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck,
  Layers,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

const processSteps = [
  {
    number: '1',
    icon: UserCheck,
    title: 'Confirm your business snapshot',
    description:
      'You’ll start by confirming your business details, key contacts, decision-makers and approval contacts. This gives Bid Manager the basic information needed to understand who you are, who we should speak to, and who can approve important actions.',
  },
  {
    number: '2',
    icon: Layers,
    title: 'Select the services you want support with',
    description:
      'You’ll choose the types of opportunities you want help with, such as tenders, grants, marketplace leads, quote requests, supplier registrations or direct proposals. These selections control which service-specific onboarding modules appear later in the process.',
  },
  {
    number: '3',
    icon: Sparkles,
    title: 'Build your proposal-ready profile',
    description:
      'You’ll provide information about your business profile, services, offers, team, experience, evidence, goals, pricing and preferred platforms. This helps us prepare reusable bid, grant, proposal and marketplace content that reflects your business accurately.',
  },
  {
    number: '4',
    icon: ShieldCheck,
    title: 'Confirm compliance, workflow and authority',
    description:
      'You’ll identify your compliance documents, licences, insurance, policies, approval process and authority rules. This is where we clarify what Bid Manager can prepare, recommend, draft or submit, and what must be approved by you first.',
  },
  {
    number: '5',
    icon: FileCheck,
    title: 'Upload or flag required documents',
    description:
      'You’ll upload available documents or mark items as will provide later, need help creating, or not applicable. The document section keeps track of what has already been received so you are not asked for the same files repeatedly, because apparently forms can learn manners.',
  },
  {
    number: '6',
    icon: Send,
    title: 'Review, declare and submit',
    description:
      'Before submitting, you’ll review your onboarding completion status, confirm the information is accurate, acknowledge the terms and confirm you are authorised to submit on behalf of the business. Once submitted, Bid Manager reviews your responses and prepares your initial setup materials.',
  },
];

const sections = [
  'Welcome',
  'Snapshot',
  'Services',
  'Profile',
  'Offers',
  'Team',
  'Proof',
  'Goals',
  'Pricing',
  'Platforms',
  'Compliance',
  'Service Modules',
  'Workflow',
  'Documents',
  'Authority',
  'Submission',
];

const preparationItems = [
  'Business registration details, ABN and contact information',
  'A clear list of services, offers, packages or work types you want to promote',
  'Examples of past work, testimonials, case studies, photos or project summaries',
  'Pricing rules, rate cards, package lists or quoting preferences, if available',
  'Insurance certificates, licences, policies, procedures or compliance documents',
  'Details of who can approve pricing, submissions, platform actions and final responses',
];

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

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 lg:p-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/10">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Approximately 45 minutes
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-headline font-bold text-foreground">
                Onboarding Process
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                The onboarding form helps Bid Manager understand your business, services,
                opportunity preferences, documents, approval rules and submission authority
                before we prepare your setup materials.
              </p>
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 space-y-12">
              <section className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">How the process works</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You will move through a structured 16-section onboarding flow. Some
                    sections are fixed for every client, while the Service Modules section
                    changes based on the services you select.
                  </p>
                </div>

                <div className="space-y-8">
                  {processSteps.map((step) => {
                    const Icon = step.icon;

                    return (
                      <div key={step.number} className="flex gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-bold text-xl">
                          {step.number}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-primary" />
                            <h3 className="text-2xl font-bold">{step.title}</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="pt-8 border-t space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">What you will complete</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The onboarding journey is organised into the following sections:
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sections.map((section, index) => (
                    <div
                      key={section}
                      className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 text-sm font-medium"
                    >
                      <span className="w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center text-xs font-bold border">
                        {index + 1}
                      </span>
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-8 border-t grid lg:grid-cols-2 gap-8">
                <Card className="border border-primary/10 shadow-none rounded-2xl bg-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold">Before you start</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You do not need every document ready before beginning. If something
                      is missing, you can mark it as coming later, not applicable, or
                      something you need help creating.
                    </p>

                    <ul className="space-y-3">
                      {preparationItems.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-relaxed">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-accent/20 shadow-none rounded-2xl bg-white">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold">After submission</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Once you submit the onboarding form, Bid Manager reviews your
                      responses and supporting documents. If key information is missing,
                      we may contact you for clarification.
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>We review your business profile, services and goals.</span>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>We identify document, compliance or authority gaps.</span>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>
                          We prepare your initial setup materials, which may include a
                          profile summary, service descriptions, compliance checklist,
                          authority matrix and recommended 30-day action plan.
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <div className="pt-8 border-t flex flex-col items-center gap-4 text-center">
                <div className="space-y-2 max-w-2xl">
                  <h2 className="text-2xl font-bold">Ready to begin?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Set aside enough time to complete the form carefully. Accurate
                    onboarding helps us recommend better opportunities, prepare stronger
                    materials and avoid the usual administrative circus.
                  </p>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="h-14 px-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 gap-2"
                >
                  <Link href="/onboarding">
                    Start Your Onboarding <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}