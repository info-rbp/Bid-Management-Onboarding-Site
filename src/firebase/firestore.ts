import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { app } from './config';
import { UserProfile, OnboardingSubmission } from './types';

const db = getFirestore(app);

export const createUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  const now = new Date().toISOString();
  
  const newProfile: UserProfile = {
    id: uid,
    email: profile.email || '',
    fullName: profile.fullName || '',
    businessName: profile.businessName || '',
    role: 'client',
    subscriptionStatus: 'not_started',
    onboardingStatus: 'not_started',
    createdAt: now,
    updatedAt: now,
    ...profile,
  };

  await setDoc(userRef, newProfile);
  return newProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const createOnboardingSubmission = async (userId: string, businessName: string) => {
  const submissionRef = doc(collection(db, 'onboardingSubmissions'));
  const now = new Date().toISOString();
  
  const submission: OnboardingSubmission = {
    id: submissionRef.id,
    userId,
    businessName,
    status: 'not_started',
    currentStep: 'welcome',
    completedSteps: [],
    completionPercentage: 0,
    selectedServices: [],
    enabledModules: {},
    sections: {},
    createdAt: now,
    updatedAt: now,
    lastSavedAt: now,
  };

  await setDoc(submissionRef, submission);
  
  // Link to user profile
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    onboardingSubmissionId: submission.id,
    onboardingStatus: 'in_progress',
    updatedAt: now,
  });

  return submission;
};

export const updateOnboardingSubmission = async (submissionId: string, updates: Partial<OnboardingSubmission>) => {
  const submissionRef = doc(db, 'onboardingSubmissions', submissionId);
  const now = new Date().toISOString();
  
  await updateDoc(submissionRef, {
    ...updates,
    updatedAt: now,
    lastSavedAt: now,
  });
};

export const getOnboardingSubmission = async (submissionId: string): Promise<OnboardingSubmission | null> => {
  const submissionRef = doc(db, 'onboardingSubmissions', submissionId);
  const submissionSnap = await getDoc(submissionRef);
  
  if (submissionSnap.exists()) {
    return submissionSnap.data() as OnboardingSubmission;
  }
  return null;
};
