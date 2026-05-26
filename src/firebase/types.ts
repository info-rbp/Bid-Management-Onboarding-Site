export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string;
  businessName: string;
  role: 'client' | 'admin';
  onboardingStatus:
    | 'not_started'
    | 'in_progress'
    | 'needs_attention'
    | 'validation_blocked'
    | 'submitted'
    | 'completed'
    | 'cancelled'
    | 'archived';
  createdAt: string;
  updatedAt: string;
  activeOnboardingSubmissionId?: string | null;
}

export interface OnboardingSubmission {
  id: string;
  userId: string;
  businessName: string;
  status:
    | 'in_progress'
    | 'needs_attention'
    | 'validation_blocked'
    | 'submitted'
    | 'completed'
    | 'cancelled'
    | 'archived';
  currentStep: string;
  visibleStepKeys: string[];
  completionPercentage: number;
  selectedServices: string[];
  enabledModules: Record<string, boolean>;
  sections: Record<string, any>;
  sectionStatuses: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
  submittedAt?: string | null;
  completedAt?: string | null;
  adminReopened?: boolean;
  googleDriveFolderId?: string | null;
  googleDriveFolderUrl?: string | null;
  driveWorkspaceStatus?: 'created' | 'pending' | 'failed' | null;
  sheetSyncStatus?: 'synced' | 'skipped' | 'error' | 'not_run' | 'unknown' | null;
}

export interface UploadedDocument {
  id: string;
  userId: string;
  onboardingSubmissionId: string;
  sectionKey: string;
  category: string;
  fileName: string;
  contentType: string;
  size: number;
  storagePath: string;
  uploadedAt: string;
  driveFileId?: string | null;
  driveFolderId?: string | null;
}
