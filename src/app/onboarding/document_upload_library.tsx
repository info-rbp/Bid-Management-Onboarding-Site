
"use client";

import React from 'react';
import { useUser } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, Trash2, FileText, Paperclip } from 'lucide-react';

interface DocumentUploadProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  submissionId: string;
}

const categories = [
  { key: 'profile', title: 'Business Profile and Brand' },
  { key: 'compliance', title: 'Compliance and Insurance' },
  { key: 'team', title: 'Team and Capability' },
  { key: 'proof', title: 'Case Studies and Proof' },
  { key: 'submissions', title: 'Previous Submissions and Feedback' },
  { key: 'commercial', title: 'Pricing and Commercial' },
  { key: 'grant', title: 'Grant Project Documents' },
  { key: 'other', title: 'Other Relevant Documents' },
];

export function DocumentUploadLibrary({ data, onChange, isLocked, submissionId }: DocumentUploadProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const uploads = data.uploads || [];

  const handleFileUpload = async (categoryKey: string, files: FileList | null) => {
    if (!files || !submissionId || !user) return;
    const storage = getStorage();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Date.now()}_${file.name}`;
      const path = `onboardingUploads/${user.uid}/${submissionId}/${categoryKey}/${fileName}`;
      const fileRef = ref(storage, path);

      try {
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        const newUploads = [...uploads, {
          id: fileName,
          name: file.name,
          size: file.size,
          category: categoryKey,
          url,
          path,
          uploadedAt: new Date().toISOString(),
          notes: '',
          status: 'uploaded'
        }];
        onChange('uploads', newUploads);
      } catch (e) {
        toast({ variant: "destructive", title: "Upload failed" });
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    if (isLocked) return;
    const newUploads = uploads.filter((f: any) => f.id !== fileId);
    onChange('uploads', newUploads);
  };

  const handleFileDetailChange = (fileId: string, field: string, value: string) => {
    const newUploads = uploads.map((f: any) => f.id === fileId ? { ...f, [field]: value } : f);
    onChange('uploads', newUploads);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Document Upload Library</h2>
        <p className="text-slate-500 text-lg leading-relaxed">Upload documents to build your reusable bid library. This is a critical step for efficient proposal generation.</p>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <Card key={cat.key} className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary"><Paperclip className="w-5 h-5" /> <span>{cat.title}</span></CardTitle>
              {!isLocked && (
                <div className="relative">
                  <input type="file" id={`upload-${cat.key}`} className="sr-only" multiple onChange={(e) => handleFileUpload(cat.key, e.target.files)} disabled={isLocked} />
                  <Button asChild variant="outline" size="sm"><label htmlFor={`upload-${cat.key}`} className="gap-2 cursor-pointer"><UploadCloud className="w-4 h-4" /> Upload Files</label></Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {uploads.filter((f: any) => f.category === cat.key).map((file: any) => (
                <div key={file.id} className="p-4 border rounded-2xl bg-slate-50/50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-500" />
                      <div className="font-bold text-slate-800">{file.name}</div>
                    </div>
                    {!isLocked && <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea value={file.notes} onChange={(e) => handleFileDetailChange(file.id, 'notes', e.target.value)} disabled={isLocked} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={file.status} onValueChange={(v) => handleFileDetailChange(file.id, 'status', v)} disabled={isLocked}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uploaded">Uploaded</SelectItem>
                          <SelectItem value="not_available">Not available yet</SelectItem>
                          <SelectItem value="not_applicable">Not applicable</SelectItem>
                          <SelectItem value="needs_updating">Needs updating</SelectItem>
                          <SelectItem value="unsure">Unsure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              {uploads.filter((f: any) => f.category === cat.key).length === 0 && (
                <div className="text-center text-slate-500 py-4">No files uploaded for this category yet.</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
