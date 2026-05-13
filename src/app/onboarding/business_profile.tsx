
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { deriveProfileUseCases } from '@/lib/onboarding-steps';

interface BusinessProfileProps {
  data: {
    plainEnglishDescription?: string;
    originStory?: string;
    problemSolved?: string;
    idealClients?: string;
    clientOutcomes?: string;
    valuesPrinciples?: string;
    clientFeedbackThemes?: string;
    clientsChooseUsBecause?: string;
    competitiveDifference?: string;
    keyMessages?: string[];
    restrictedClaimsOrLanguage?: string;
  };
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  fieldErrors?: Record<string, string>;
  allData?: any;
}

export function BusinessProfile({ data, onChange, isLocked, allData }: BusinessProfileProps) {
  const keyMessages = data.keyMessages || ['', '', ''];
  const selectedServices = allData?.selectedServices || [];
  const useCases = deriveProfileUseCases(selectedServices);

  const handleKeyMessageChange = (index: number, value: string) => {
    if (isLocked) return;
    const newMessages = [...keyMessages];
    newMessages[index] = value;
    onChange('keyMessages', newMessages);
  };

  const renderField = (id: string, label: string, helper: string, required: boolean = true, minLength: number = 20) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-base font-bold text-slate-900">{label}</Label>
        {required && <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Required</Badge>}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{helper}</p>
      <Textarea
        id={id}
        value={(data as any)[id] || ''}
        onChange={(e) => onChange(id, e.target.value)}
        disabled={isLocked}
        className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-primary/20 transition-all"
        placeholder="Type your response here..."
      />
      {required && (data as any)[id] && (data as any)[id].length < minLength && (
        <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
          <Info className="w-3 h-3" /> Minimum recommended length: {minLength} characters
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Business Profile, Positioning and Value Proposition</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “This section helps us understand who your business is, what you do, who you serve, what makes you credible, and how your business should be positioned in proposals, tenders, grants, marketplace profiles and direct business development material.”
        </div>
      </div>

      {/* GROUP 1: BUSINESS OVERVIEW */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
          <h3 className="text-xl font-bold text-slate-900">Business Overview</h3>
        </div>
        
        {renderField('plainEnglishDescription', '4.1 In plain English, what does your business do?', 'Describe what your business does in simple language. Avoid jargon where possible.')}
        {renderField('originStory', '4.2 Why was the business started?', 'Explain the reason, mission, gap in the market, personal story or business opportunity that led to the business being started.')}
        {renderField('problemSolved', '4.3 What problem does your business solve for clients or customers?', 'Describe the client or customer problem your business helps fix, reduce, manage or improve.')}
      </section>

      {/* GROUP 2: CLIENTS AND OUTCOMES */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
          <h3 className="text-xl font-bold text-slate-900">Clients and Outcomes</h3>
        </div>
        
        {renderField('idealClients', '4.4 Who are your ideal clients or customers?', 'Include industries, organisation types, business sizes, buyer types, locations or specific names where relevant.')}
        {renderField('clientOutcomes', '4.5 What outcomes or results do clients receive from your work?', 'Include measurable outcomes where possible, such as time saved, cost reduced, increased revenue, improved safety, improved compliance, faster delivery, improved quality or better customer experience.')}
      </section>

      {/* GROUP 3: POSITIONING AND DIFFERENTIATION */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
          <h3 className="text-xl font-bold text-slate-900">Positioning and Differentiation</h3>
        </div>
        
        {renderField('valuesPrinciples', '4.6 What are your business values or principles?', 'Examples: reliability, transparency, safety, quality, local knowledge, responsiveness, fairness, sustainability, community benefit or client care.', false)}
        {renderField('clientFeedbackThemes', '4.7 What do clients usually say about working with you?', 'Include common feedback, reputation themes or informal comments clients make about your work.', false)}
        {renderField('clientsChooseUsBecause', '4.8 Complete this sentence: Clients choose us because...', 'Focus on the strongest reasons clients choose your business instead of another provider.')}
        {renderField('competitiveDifference', '4.9 What makes your business different from competitors?', 'Consider experience, response time, local knowledge, specialist skills, systems, quality, pricing, outcomes or customer service.')}

        <div className="space-y-6">
          <div className="space-y-1">
            <Label className="text-base font-bold text-slate-900">4.10 What are the top three things you want buyers, funders or clients to remember about your business?</Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These should be the three main ideas someone remembers after reading your profile, proposal, grant application or marketplace bio.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {keyMessages.map((msg, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-xs border border-slate-100">
                  #{i + 1}
                </div>
                <Input
                  value={msg}
                  onChange={(e) => handleKeyMessageChange(i, e.target.value)}
                  disabled={isLocked}
                  placeholder={`Key message ${i + 1}`}
                  className="rounded-xl border-slate-200 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GROUP 4: MESSAGING RESTRICTIONS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
          <h3 className="text-xl font-bold text-slate-900">Messaging Restrictions</h3>
        </div>
        
        {renderField('restrictedClaimsOrLanguage', '4.11 Are there any claims, words, descriptions, guarantees or positioning statements you do not want used when describing your business?', 'Examples: guarantees, unsupported claims, words that do not fit your brand, services you do not want promoted, certifications you do not hold, or claims that require approval before use.', false)}
      </section>

      {/* Summary Card */}
      {data.plainEnglishDescription && (
        <Card className="bg-slate-900 border-none rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white">Profile Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Business Overview</p>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{data.plainEnglishDescription}"</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ideal Clients</p>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{data.idealClients}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key Differentiator</p>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{data.competitiveDifference}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top 3 Key Messages</p>
                  <div className="space-y-2">
                    {keyMessages.filter(m => m.trim()).map((m, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-800">
                        <span className="text-primary font-bold text-xs">{i + 1}</span>
                        <span className="text-xs text-slate-300 font-medium">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Reuse Contexts</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(useCases)
                      .filter(([_, active]) => active)
                      .map(([key]) => (
                        <Badge key={key} className="bg-slate-800 text-slate-400 border-none px-2 py-1 text-[9px] font-bold capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </Badge>
                      ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed italic">
                    Based on your selected services, this information may be used for the contexts above.
                  </p>
                </div>

                {data.restrictedClaimsOrLanguage && (
                  <div className="pt-4 border-t border-slate-800">
                     <div className="flex items-center gap-2 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Messaging Restrictions Active</span>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
