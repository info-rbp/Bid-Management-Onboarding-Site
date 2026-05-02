
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield, BookOpen, UserCheck, MessageSquareWarning, Save, Info, Check } from 'lucide-react';

interface WelcomeExpectationsProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

export function WelcomeExpectations({ data, onChange, isLocked }: WelcomeExpectationsProps) {
  const acknowledgements = [
    {
      id: 'terms',
      icon: BookOpen,
      label: 'I have read and agree to the Terms and Conditions.',
      description: 'You must agree to our terms to proceed.',
    },
    {
      id: 'authority',
      icon: UserCheck,
      label: 'I confirm I have the authority to complete this on behalf of the business.',
      description: 'This is a legal declaration of your role.',
    },
    {
      id: 'infoUse',
      icon: Shield,
      label: 'I acknowledge Bid Manager will use this information to represent my business.',
      description: 'The data you provide will be used in bids and proposals.',
    },
    {
      id: 'accuracy',
      icon: Check,
      label: 'I acknowledge that I am responsible for the accuracy and completeness of all information provided.',
      description: 'Final responsibility for submitted content rests with you.',
    },
    {
      id: 'saveAndReturn',
      icon: Save,
      label: 'I understand that my progress is saved automatically and I can return later.',
      description: 'You do not need to complete this in one session.',
    },
    {
      id: 'passwordWarning',
      icon: MessageSquareWarning,
      label: 'I understand I should not provide any passwords in this onboarding pack.',
      description: 'For security, never share passwords with us.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Welcome & Expectations</h2>
        <p className="text-slate-500 text-lg leading-relaxed">
          Before we begin, please review and acknowledge the following critical points. This ensures a clear, secure, and effective partnership from day one.
        </p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-slate-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Info className="w-5 h-5" />
            <span>Key Acknowledgements</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          {acknowledgements.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 bg-white rounded-2xl border shadow-sm">
              <Checkbox
                id={item.id}
                checked={data[item.id] || false}
                onCheckedChange={(checked) => onChange(item.id, checked)}
                disabled={isLocked}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor={item.id} className="font-bold text-slate-800">
                  {item.label}
                </Label>
                <p className="text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Label htmlFor="notes" className="font-bold text-slate-900">
          Optional Pre-onboarding Notes
        </Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Is there anything we should know before we start? (e.g., upcoming deadlines, specific goals)"
          disabled={isLocked}
          className="h-32 rounded-2xl"
        />
        <p className="text-xs text-muted-foreground">
          This field is optional. Use it to provide any immediate context that might be helpful.
        </p>
      </div>
    </div>
  );
}
