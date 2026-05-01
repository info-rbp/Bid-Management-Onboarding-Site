"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import Link from 'next/link';

export default function FAQsPage() {
  const faqs = [
    {
      question: "How long does the initial setup take?",
      answer: "The automated onboarding process takes approximately 45 minutes to complete. Once finished, our systems will provision your workspace within minutes, and a kick-off call is typically scheduled within 24-48 hours."
    },
    {
      question: "Who will be handling my bid projects?",
      answer: "You will be assigned a dedicated Bid Manager who is supported by our team of strategic bid writers and researchers. They will act as an extension of your own team."
    },
    {
      question: "What industries do you specialize in?",
      answer: "We have experience across a wide range of sectors including Construction, IT & Technology Services, Facilities Management, Healthcare, and Professional Services. Our core expertise lies in the strategic bid process itself."
    },
    {
      question: "How do you ensure data confidentiality?",
      answer: "We use secure, client-dedicated Google Shared Drives with restricted permissions. All our staff operate under strict NDAs, and our internal processes are designed with data protection and confidentiality at the forefront."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time through your dashboard. Changes will take effect at the start of your next billing cycle."
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
            <h1 className="text-4xl font-headline font-bold text-foreground">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">Everything you need to know about partnering with Bid Manager.</p>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-b-0">
                    <AccordionTrigger className="text-left font-bold text-lg py-4 hover:no-underline hover:text-primary transition-colors bg-muted/30 px-6 rounded-xl">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pt-4 text-muted-foreground leading-relaxed text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Still have questions?</p>
            <Button asChild variant="outline" className="h-12 px-8 rounded-xl border-2">
              <Link href="mailto:support@bidmanager.com">Contact Support</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
