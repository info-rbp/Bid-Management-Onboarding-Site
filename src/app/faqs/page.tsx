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
  HelpCircle,
  Mail,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

const quickFacts = [
  {
    icon: Clock,
    title: 'Approx. 45 minutes',
    description:
      'Set aside enough time to complete the onboarding properly. You can save progress as you go.',
  },
  {
    icon: UploadCloud,
    title: 'Upload what you have',
    description:
      'Missing documents can be marked as will provide later, need help creating, or not applicable.',
  },
  {
    icon: ShieldCheck,
    title: 'Authority matters',
    description:
      'You control what Bid Manager can draft, prepare, recommend, update or submit on your behalf.',
  },
];

const faqs = [
  {
    question: 'What is the onboarding form for?',
    answer:
      'The onboarding form helps Bid Manager understand your business, services, team, evidence, goals, pricing, platforms, compliance documents, workflow preferences and authority rules. The information is used to prepare your setup materials and guide how we support tenders, grants, marketplace leads, quote requests, supplier registrations and direct proposals.',
  },
  {
    question: 'How long does onboarding take?',
    answer:
      'Most clients should allow approximately 45 minutes. It may take longer if you want to upload documents, provide detailed service descriptions or complete several service-specific modules. The process is deliberately thorough because guessing your approval rules later would be a spectacularly bad idea.',
  },
  {
    question: 'Do I need to complete everything in one sitting?',
    answer:
      'No. The application saves your progress as you move through the sections. You can return later and continue from your dashboard. Before final submission, the app will show which sections still need attention.',
  },
  {
    question: 'What sections are included in the onboarding process?',
    answer:
      'The onboarding process includes Welcome, Snapshot, Services, Profile, Offers, Team, Proof, Goals, Pricing, Platforms, Compliance, Service Modules, Workflow, Documents, Authority and Submission. Some sections collect general business information, while Service Modules changes based on the services you select.',
  },
  {
    question: 'Why does the Service Modules section change?',
    answer:
      'Section 12 is dynamic. If you select government tenders, the app shows tender readiness questions. If you select grants, it shows grant-specific questions. If you select marketplace leads, direct proposals or quote requests, it shows the relevant strategy and quote support modules. This avoids asking you irrelevant questions, which is rare mercy from a form.',
  },
  {
    question: 'What documents should I prepare before starting?',
    answer:
      'Useful documents include your capability statement, service descriptions, staff CVs or bios, licences, certifications, insurance certificates, policies, case studies, testimonials, pricing schedules, previous proposals, grant material, quote templates and examples of past work. You do not need every document ready before starting.',
  },
  {
    question: 'What if I do not have a required document yet?',
    answer:
      'You can mark a document as will provide later, need help creating, or not applicable. This lets Bid Manager see what is ready now and what needs follow-up. Uploading an old or incorrect document just to fill a gap is not helpful, even though paperwork often tempts people into nonsense.',
  },
  {
    question: 'Will documents uploaded earlier appear in the Documents section?',
    answer:
      'Yes. Where supported, documents uploaded in earlier sections such as Team, Proof, Pricing, Compliance or Service Modules should appear in the Documents section as received. You can still upload additional files in the Documents section if needed.',
  },
  {
    question: 'What file types can I upload?',
    answer:
      'The application is designed to support common business document and image formats such as PDF, DOCX, XLSX, PNG and JPG. If a file is rejected, check the file type and size, then try a cleaner version of the document.',
  },
  {
    question: 'What is the Authority section for?',
    answer:
      'The Authority section confirms what Bid Manager is allowed to do for you. This includes drafting responses, providing pricing, submitting tenders or quotes, updating platform profiles, using supplied documents and managing reusable bid content. If there is a conflict between earlier preferences and the Authority section, the Authority section should take priority.',
  },
  {
    question: 'Can Bid Manager submit responses for me?',
    answer:
      'Only if you authorise it. The onboarding form asks whether Bid Manager can submit certain responses, whether approval is required first, and whether thresholds apply. If final written approval is required, the app should treat that as the controlling rule.',
  },
  {
    question: 'What happens after I submit onboarding?',
    answer:
      'Once submitted, your onboarding is locked for review. Bid Manager reviews your responses, document status, compliance gaps, service modules, workflow rules and authority settings. If clarification is needed, we may contact you before preparing your setup materials.',
  },
  {
    question: 'Can I edit my onboarding after submission?',
    answer:
      'Normally, submitted onboarding is locked so there is a clear record of what was provided. If changes are needed, Bid Manager may reopen the submission or request updated information separately.',
  },
  {
    question: 'Will I receive confirmation after signing up or submitting?',
    answer:
      'The application includes notification logic for new user signups and completed onboarding submissions. These notifications help Bid Manager know when a client has created an account or submitted their onboarding for review.',
  },
  {
    question: 'Who should complete the onboarding form?',
    answer:
      'The form should be completed by someone who understands the business, services, pricing, documents and approval process. If multiple people are involved, nominate the right contacts in the Snapshot, Workflow and Authority sections so Bid Manager knows who to contact for decisions.',
  },
];

export default function FAQsPage() {
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
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Common questions
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-headline font-bold text-foreground">
                Frequently Asked Questions
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                Answers to the main questions clients usually have before starting
                the Bid Manager onboarding process.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {quickFacts.map((fact) => {
              const Icon = fact.icon;

              return (
                <Card
                  key={fact.title}
                  className="border border-slate-200 shadow-sm rounded-2xl bg-white"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-bold text-lg">{fact.title}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {fact.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Onboarding FAQs</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These answers cover the live onboarding flow, including dynamic
                  service modules, documents, authority rules and final submission.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, idx) => (
                  <AccordionItem
                    key={faq.question}
                    value={`item-${idx}`}
                    className="border-b-0"
                  >
                    <AccordionTrigger className="text-left font-bold text-base lg:text-lg py-4 hover:no-underline hover:text-primary transition-colors bg-muted/30 px-6 rounded-xl">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pt-4 text-muted-foreground leading-relaxed text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <section className="pt-8 border-t grid lg:grid-cols-2 gap-6">
                <Card className="border border-primary/10 shadow-none rounded-2xl bg-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Best way to complete onboarding
                    </h2>

                    <div className="space-y-3 text-sm leading-relaxed">
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>
                          Use accurate business, contact and approval information.
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>
                          Select only the services you actually want support with.
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>
                          Upload current documents where available and flag missing
                          items honestly.
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>
                          Be clear about pricing, approval thresholds and submission
                          authority.
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-accent/20 shadow-none rounded-2xl bg-white">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-primary" />
                      Still unsure?
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Start the onboarding form and complete what you can. If an item is
                      not ready, the Documents section and final review process are
                      designed to show what still needs attention.
                    </p>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The goal is to build a useful setup record, not to force you into
                      pretending every policy, licence and case study is magically sitting
                      in the perfect folder. Human paperwork remains, regrettably, human.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <div className="pt-8 border-t flex flex-col items-center gap-4 text-center">
                <div className="space-y-2 max-w-2xl">
                  <h2 className="text-2xl font-bold">Ready to begin?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The onboarding form will guide you through each section and show
                    what still needs to be completed before final submission.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-10 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 gap-2"
                  >
                    <Link href="/onboarding">
                      Start Your Onboarding <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-10 rounded-xl text-lg font-bold border-2 gap-2"
                  >
                    <Link href="mailto:tenders@remotebusinesspartner.com.au">
                      <Mail className="w-5 h-5" /> Contact Bid Manager
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}