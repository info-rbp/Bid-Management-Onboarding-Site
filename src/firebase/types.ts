export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  role: 'client' | 'admin';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'not_started';
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  onboardingStatus: 'not_started' | 'in_progress' | 'ready_for_review' | 'submitted';
  createdAt: string;
  updatedAt: string;
  onboardingSubmissionId?: string | null;
}

export interface OnboardingSubmission {
  id: string;
  userId: string;
  businessName: string;
  status: 'not_started' | 'in_progress' | 'ready_for_review' | 'submitted';
  currentStep: string;
  completedSteps: string[];
  completionPercentage: number;
  selectedServices: string[];
  enabledModules: Record<string, boolean>;
  sections: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
  submittedAt?: string | null;
  adminReopened?: boolean;
  googleDriveFolderId?: string | null;
  googleDriveFolderUrl?: string | null;
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
