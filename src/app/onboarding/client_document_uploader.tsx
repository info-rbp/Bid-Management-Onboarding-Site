"use client";

import React, { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { buildDocumentMetadata, type DocumentCategory, type SourceSection } from '@/lib/document-categories';

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

interface ClientDocumentUploaderProps {
  documentCategory: DocumentCategory;
  sourceSection: SourceSection;
  linkedSections?: string[];
  linkedRequirementIds?: string[];
  label: string;
  description?: string;
  disabled?: boolean;
  isLocked?: boolean;
  onUploaded?: (documentId: string) => void;
}

export function ClientDocumentUploader({
  documentCategory,
  sourceSection,
  linkedSections,
  linkedRequirementIds,
  label,
  description,
  disabled,
  isLocked,
  onUploaded
}: ClientDocumentUploaderProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const isDisabled = Boolean(disabled || isLocked || isUploading);

  const onSelectFiles = async (files: FileList | null) => {
    if (!files || !user || !db) return;
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        toast({ variant: 'destructive', title: `Upload failed: Unsupported file type .${extension || 'unknown'}` });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: 'destructive', title: 'Upload failed: File is too large (max 25MB)' });
        continue;
      }

      const storage = getStorage();
      const documentId = crypto.randomUUID();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storedFileName = `${documentId}_${safeFileName}`;
      const storagePath = `clients/${user.uid}/documents/${documentCategory}/${storedFileName}`;

      try {
        const uploadTask = uploadBytesResumable(ref(storage, storagePath), file);
        const snapshot = await new Promise<any>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            () => resolve(uploadTask.snapshot)
          );
        });

        const downloadUrl = await getDownloadURL(snapshot.ref);
        const metadata = buildDocumentMetadata({
          documentId,
          clientId: user.uid,
          originalFileName: file.name,
          storedFileName,
          fileType: file.type,
          fileExtension: extension,
          fileSize: file.size,
          storagePath,
          downloadUrl,
          documentCategory,
          sourceSection,
          linkedSections,
          linkedRequirementIds
        });

        await setDoc(doc(db, 'clients', user.uid, 'documents', documentId), {
          ...metadata,
          uploadedAt: serverTimestamp(),
          uploadedBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setProgress(100);
        onUploaded?.(documentId);
        toast({ title: `Upload complete: ${file.name}` });
      } catch (error) {
        const message = (error as Error)?.message || String(error);
        toast({ variant: 'destructive', title: `Upload failed: ${message}` });
      }
    }

    setIsUploading(false);
    setProgress(0);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4 bg-white">
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-slate-900">{label}</Label>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <input
        type="file"
        id={`${sourceSection}-${documentCategory}`}
        className="sr-only"
        multiple
        onChange={(e) => onSelectFiles(e.target.files)}
        disabled={isDisabled}
      />
      <Button asChild variant="outline" disabled={isDisabled}>
        <Label htmlFor={`${sourceSection}-${documentCategory}`} className="cursor-pointer">Upload files</Label>
      </Button>
      {isUploading ? <Progress value={progress} /> : null}
    </div>
  );
}
