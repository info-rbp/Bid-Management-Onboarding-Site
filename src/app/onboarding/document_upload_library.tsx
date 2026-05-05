
"use client";

import React, { useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  FileText, 
  Paperclip, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  HelpCircle, 
  ShieldCheck, 
  Globe, 
  Briefcase,
  Zap,
  FolderOpen
} from 'lucide-react';
import { deriveDocumentReadiness } from '@/lib/onboarding-steps';
import {
  DOCUMENT_CATEGORIES,
  getSourceSectionLabel
} from '@/lib/document-categories';
import { ClientDocumentUploader } from './client_document_uploader';

interface DocumentUploadProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  submissionId: string;
  allData?: any;
}

const baseCategories = Object.values(DOCUMENT_CATEGORIES);

export function DocumentUploadLibrary({ data, onChange, isLocked, submissionId, allData }: DocumentUploadProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  // Explicitly query only the current user's documents
  const docsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    // Querying the collection directly as it's scoped by path in the rules
    return collection(db, 'clients', user.uid, 'documents');
  }, [user, db]);

  const { data: clientDocuments } = useCollection(docsQuery);
  
  const selectedServices = allData?.sections?.service_selection?.selectedServices || [];
  const activeModules = allData?.sections?.service_modules?.activeModules || {};

  const categories = useMemo(() => {
    return baseCategories.filter(cat => {
      if (cat.id === 'grant_project_documents_budgets_supplier_quotes_support_letters') {
        return selectedServices.includes('grants') || activeModules.grants;
      }
      return true;
    });
  }, [selectedServices, activeModules]);

  const persistedCategoryState = useMemo(() => {
    const byCategory = categories.reduce((acc, cat) => {
      const existing = data?.categories?.[cat.id] || {};
      const receivedDocumentIds = Array.isArray(existing.receivedDocumentIds) ? existing.receivedDocumentIds : [];
      const status = existing.status || (receivedDocumentIds.length > 0 ? 'received' : 'pending');
      acc[cat.id] = {
        receivedDocumentIds,
        status,
        updatedAt: existing.updatedAt || null
      };
      return acc;
    }, {} as Record<string, { receivedDocumentIds: string[]; status: string; updatedAt?: any }>);

    const allReceivedDocumentIds = Object.values(byCategory).flatMap((entry) => entry.receivedDocumentIds);
    const derivedDocumentReadiness = deriveDocumentReadiness([], clientDocuments || [], selectedServices);

    return {
      categories: byCategory,
      receivedDocumentIds: allReceivedDocumentIds,
      derivedDocumentReadiness
    };
  }, [categories, data?.categories, clientDocuments, selectedServices]);

  useEffect(() => {
    if (!clientDocuments) return;

    const computedCategories = categories.reduce((acc, cat) => {
      const categoryDocs = (clientDocuments || []).filter((d: any) => d.documentCategory === cat.id && d.status !== 'do_not_use');
      const receivedDocumentIds = categoryDocs.map((d: any) => d.documentId || d.id).filter(Boolean);
      acc[cat.id] = {
        receivedDocumentIds,
        status: receivedDocumentIds.length > 0 ? 'received' : 'pending',
        updatedAt: new Date().toISOString()
      };
      return acc;
    }, {} as Record<string, { receivedDocumentIds: string[]; status: string; updatedAt: string }>);

    const nextPayload = {
      categories: computedCategories,
      receivedDocumentIds: Object.values(computedCategories).flatMap((entry) => entry.receivedDocumentIds),
      derivedDocumentReadiness: deriveDocumentReadiness([], clientDocuments || [], selectedServices)
    };

    const existingComparable = JSON.stringify({
      categories: data?.categories || {},
      receivedDocumentIds: data?.receivedDocumentIds || [],
      derivedDocumentReadiness: data?.derivedDocumentReadiness || {}
    });
    const nextComparable = JSON.stringify(nextPayload);

    if (existingComparable !== nextComparable) {
      onChange('categories', nextPayload.categories);
      onChange('receivedDocumentIds', nextPayload.receivedDocumentIds);
      onChange('derivedDocumentReadiness', nextPayload.derivedDocumentReadiness);
    }
  }, [categories, clientDocuments, data?.categories, data?.derivedDocumentReadiness, data?.receivedDocumentIds, onChange, selectedServices]);

  const getFilesForCategory = (categoryId: string) => {
    return (clientDocuments || []).filter((doc: any) => doc.documentCategory === categoryId);
  };

  const readiness = data?.derivedDocumentReadiness || persistedCategoryState.derivedDocumentReadiness;

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Document Upload Library</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “Please upload any documents that may help us build your client profile, proposal content, compliance library, case studies, pricing guidance, opportunity action plan and platform materials. If you do not have a document yet, skip the upload and we will record it as a gap to review.”
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => {
          const files = getFilesForCategory(cat.id);
          const persistedCategory = persistedCategoryState.categories[cat.id];
          const isReceived = persistedCategory?.status === 'received';
          const hasFiles = isReceived || files.length > 0;

          return (
            <Card key={cat.id} className={`border-2 rounded-[2rem] overflow-hidden transition-all ${hasFiles ? 'border-green-100 bg-green-50/10' : 'border-slate-100'}`}>
              <CardHeader className="p-8 border-b border-slate-100 bg-white/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hasFiles ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {hasFiles ? <CheckCircle2 className="w-6 h-6" /> : <FolderOpen className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{cat.label}</h3>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                  {!isLocked && (
                    <div className="w-64">
                      <ClientDocumentUploader
                        documentCategory={cat.id}
                        sourceSection="section_14_documents"
                        linkedSections={["section_14_documents"]}
                        linkedRequirementIds={[cat.id]}
                        label="Upload files"
                        disabled={isLocked}
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {hasFiles ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-700 truncate">{file.originalFileName}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Source: {getSourceSectionLabel(file.sourceSection)}</p>
                          </div>
                        </div>
                        <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline px-2 py-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                    <p className="text-sm text-slate-400 font-medium italic">No documents received for this category yet.</p>
                  </div>
                )}              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardContent className="p-10 space-y-10">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Paperclip className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Document Library Summary</h3>
              <p className="text-slate-400 text-sm">Library readiness & data management.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3" /> Coverage
              </p>
              <div className="space-y-3">
                <ReadinessBadge active={readiness.hasBusinessProfileDocs} label="Business Profile" />
                <ReadinessBadge active={readiness.hasInsuranceCertificates} label="Insurance" />
                <ReadinessBadge active={readiness.hasPoliciesProcedures} label="Policies" />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Capability
              </p>
              <div className="space-y-3">
                <ReadinessBadge active={readiness.hasStaffDocuments} label="Staff Documentation" />
                <ReadinessBadge active={readiness.hasProofDocuments} label="Case Studies & Proof" />
                <ReadinessBadge active={readiness.hasPricingDocuments} label="Pricing & Budgets" />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" /> Service Readiness
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <ChannelBadge active={readiness.tenderDocumentReady} label="Tenders" />
                <ChannelBadge active={readiness.grantDocumentReady} label="Grants" />
                <ChannelBadge active={readiness.marketplaceDocumentReady} label="Marketplace" />
                <ChannelBadge active={readiness.quoteDocumentReady} label="Quotes" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center space-y-6">
            <p className="text-sm text-slate-400 italic">
              “Based on your uploaded documents, Bid Manager can build your client document library and identify any gaps before preparing proposals or tenders.”
            </p>
            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-lg">
                 <Checkbox 
                  id="final-confirm" 
                  checked={data.clientDocumentConfirmation} 
                  onCheckedChange={(v) => onChange('clientDocumentConfirmation', !!v)} 
                  disabled={isLocked}
                  className="w-6 h-6 rounded-lg border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                 />
                 <Label htmlFor="final-confirm" className="text-sm font-bold text-white text-left leading-snug cursor-pointer">
                    I have uploaded the documents currently available or marked unavailable documents for follow-up.
                 </Label>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReadinessBadge({ active, label }: { active: boolean, label: string }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-slate-800/50 border-slate-800 text-slate-600'}`}>
      {active ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700" />}
      <span className="text-xs font-bold truncate">{label}</span>
    </div>
  );
}

function ChannelBadge({ active, label }: { active: boolean, label: string }) {
  return (
    <Badge variant="outline" className={`border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${active ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'}`}>
      {label}
    </Badge>
  );
}
