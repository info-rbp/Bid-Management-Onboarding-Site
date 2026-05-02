
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AuthorityMatrixProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const authorityActions = [
  { key: 'search_ops', label: 'Search for opportunities' },
  { key: 'recommend_ops', label: 'Recommend opportunities' },
  { key: 'update_profiles', label: 'Create or update platform profiles' },
  { key: 'register_free', label: 'Register on free platforms' },
  { key: 'register_paid', label: 'Register on paid platforms' },
  { key: 'assist_regs', label: 'Assist with supplier, tender, or grant registrations' },
  { key: 'draft_responses', label: 'Draft responses, quotes, and applications' },
  { key: 'ask_questions', label: 'Ask clarification questions' },
  { key: 'communicate_buyers', label: 'Communicate with buyers, funders, or leads' },
  { key: 'prepare_market_res', label: 'Prepare marketplace responses' },
  { key: 'submit_market_res', label: 'Submit marketplace responses' },
  { key: 'submit_quotes', label: 'Submit quote requests' },
  { key: 'submit_tenders', label: 'Submit tenders' },
  { key: 'submit_grants', label: 'Submit grants' },
  { key: 'provide_pricing', label: 'Provide pricing' },
  { key: 'accept_terms', label: 'Accept terms or contract conditions', highRisk: true },
  { key: 'use_docs', label: 'Use supplied documents in submissions' },
  { key: 'maintain_library', label: 'Maintain a reusable bid library' },
  { key: 'follow_up', label: 'Follow up with buyers, funders, or leads' },
];

const authorityOptions = ["Authorised", "Authorised after approval", "Not authorised", "Unsure"];

export function AuthorityMatrix({ data, onChange, isLocked }: AuthorityMatrixProps) {
  const matrix = data.matrix || {};

  const handleMatrixChange = (key: string, value: string) => {
    onChange('matrix', { ...matrix, [key]: value });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Authority Matrix</h2>
        <p className="text-slate-500 text-lg">Confirm what Bid Manager can do on your behalf. This is critical for establishing clear rules of engagement.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Action</TableHead>
            {authorityOptions.map(o => <TableHead key={o} className="text-center">{o}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {authorityActions.map(action => (
            <TableRow key={action.key}>
              <TableCell className="font-bold">
                {action.label}
                {action.highRisk && <AlertTriangle className="w-4 h-4 inline-block ml-2 text-orange-500" />}
              </TableCell>
              {authorityOptions.map(option => (
                <TableCell key={option} className="text-center">
                  <RadioGroup value={matrix[action.key] || ''} onValueChange={(v) => handleMatrixChange(action.key, v)} className="justify-center">
                    <RadioGroupItem value={option} disabled={isLocked} />
                  </RadioGroup>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader><CardTitle>Approval Contacts</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2"><Label>Final Submission Approver</Label><Input value={data.finalApprover || ''} onChange={(e) => onChange('finalApprover', e.target.value)} disabled={isLocked}/></div>
          <div className="space-y-2"><Label>Pricing Approver</Label><Input value={data.pricingApprover || ''} onChange={(e) => onChange('pricingApprover', e.target.value)} disabled={isLocked}/></div>
          <div className="space-y-2"><Label>Contract Terms Approver</Label><Input value={data.termsApprover || ''} onChange={(e) => onChange('termsApprover', e.target.value)} disabled={isLocked}/></div>
          <div className="space-y-2"><Label>Paid Platform Approver</Label><Input value={data.paidApprover || ''} onChange={(e) => onChange('paidApprover', e.target.value)} disabled={isLocked}/></div>
        </CardContent>
      </Card>
       <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader><CardTitle>Prohibitions and Thresholds</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Actions never allowed without written approval</Label><Textarea value={data.neverAllowed || ''} onChange={(e) => onChange('neverAllowed', e.target.value)} disabled={isLocked}/></div>
          <div><Label>Prohibited claims, guarantees, prices, or commitments</Label><Textarea value={data.prohibitedClaims || ''} onChange={(e) => onChange('prohibitedClaims', e.target.value)} disabled={isLocked}/></div>
        </CardContent>
      </Card>
    </div>
  );
}
