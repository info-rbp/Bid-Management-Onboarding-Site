"use client";

import { collection, type FirestoreDataConverter } from 'firebase/firestore';
import { initializeFirebase } from './index';
import { UserProfile, OnboardingSubmission } from './types';

const { firestore: db } = initializeFirebase();

const getConverter = <T,>(): FirestoreDataConverter<T> => ({
  toFirestore: (data) => data as Record<string, unknown>,
  fromFirestore: (snap) => snap.data() as T,
});

const getCollection = <T,>(collectionName: string) =>
  collection(db, collectionName).withConverter(getConverter<T>());

export { db, getCollection, getConverter };

export const usersCollection = getCollection<UserProfile>('users');
export const submissionsCollection = getCollection<OnboardingSubmission>('onboardingSubmissions');
