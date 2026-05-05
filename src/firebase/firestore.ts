
"use client";

import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { app } from './config';
import { UserProfile, OnboardingSubmission } from './types';

const db = getFirestore(app);

const getConverter = <T,>() => ({
  toFirestore: (data: any) => data,
  fromFirestore: (snap: any) => snap.data() as T,
});

const getCollection = <T,>(collectionName: string) => collection(db, collectionName).withConverter(getConverter<T>());

export { db, getCollection, getConverter };

// Specific collection helpers
export const usersCollection = getCollection<UserProfile>('users');
export const submissionsCollection = getCollection<OnboardingSubmission>('onboardingSubmissions');
