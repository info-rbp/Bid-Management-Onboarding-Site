import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import {
  buildInitialSubmission,
  getSubmissionResumeStep,
  isActiveOnboardingStatus,
} from '@/lib/onboarding-submission';
import {
  applyRateLimit,
  HttpError,
  jsonError,
  requireFirebaseUser,
} from '@/lib/server/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getRouteForStep(currentStep: unknown): string {
  const step =
    typeof currentStep === 'string' && currentStep.trim()
      ? currentStep.trim()
      : 'welcome_expectations';

  return `/onboarding/${step}`;
}

function getBusinessName(userData: FirebaseFirestore.DocumentData | undefined): string {
  const businessName = userData?.businessName;

  if (typeof businessName === 'string' && businessName.trim()) {
    return businessName.trim();
  }

  return 'My Business';
}

async function getExistingActiveSubmissionById(
  submissionId: string,
  uid: string
): Promise<{ id: string; data: FirebaseFirestore.DocumentData } | null> {
  const db = getAdminDb();

  const submissionSnap = await db
    .collection('onboardingSubmissions')
    .doc(submissionId)
    .get();

  if (!submissionSnap.exists) return null;

  const submissionData = submissionSnap.data();

  if (!submissionData) return null;
  if (submissionData.userId !== uid) return null;
  if (!isActiveOnboardingStatus(submissionData.status)) return null;

  return {
    id: submissionSnap.id,
    data: submissionData,
  };
}

async function findLatestActiveSubmission(
  uid: string
): Promise<{ id: string; data: FirebaseFirestore.DocumentData } | null> {
  const db = getAdminDb();

  const snapshot = await db
    .collection('onboardingSubmissions')
    .where('userId', '==', uid)
    .orderBy('updatedAt', 'desc')
    .limit(10)
    .get();

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    if (isActiveOnboardingStatus(data.status)) {
      return {
        id: docSnap.id,
        data,
      };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const decodedToken = await requireFirebaseUser(req);
    const uid = decodedToken.uid;

    applyRateLimit({
      request: req,
      scope: 'onboarding-start',
      subject: uid,
      limit: 20,
      windowMs: 60_000,
    });

    const db = getAdminDb();

    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    let userData = userSnap.exists ? userSnap.data() : undefined;

    if (!userSnap.exists) {
      userData = {
        id: uid,
        email: decodedToken.email || null,
        fullName: decodedToken.name || 'Client User',
        businessName: 'Business Name Pending',
        role: 'client',
        onboardingStatus: 'not_started',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await userRef.set(userData, { merge: true });
    }

    const activeSubmissionId =
      typeof userData?.activeOnboardingSubmissionId === 'string'
        ? userData.activeOnboardingSubmissionId
        : null;

    if (activeSubmissionId) {
      const activeSubmission = await getExistingActiveSubmissionById(
        activeSubmissionId,
        uid
      );

      if (activeSubmission) {
        const currentStep = getSubmissionResumeStep(activeSubmission.data);

        return NextResponse.json({
          submissionId: activeSubmission.id,
          currentStep,
          route: getRouteForStep(currentStep),
          created: false,
        });
      }
    }

    const latestActiveSubmission = await findLatestActiveSubmission(uid);

    if (latestActiveSubmission) {
      const currentStep = getSubmissionResumeStep(latestActiveSubmission.data);

      await userRef.set(
        {
          activeOnboardingSubmissionId: latestActiveSubmission.id,
          onboardingStatus: latestActiveSubmission.data.status || 'in_progress',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json({
        submissionId: latestActiveSubmission.id,
        currentStep,
        route: getRouteForStep(currentStep),
        created: false,
      });
    }

    const newSubmissionRef = db.collection('onboardingSubmissions').doc();
    const currentStep = 'welcome_expectations';

    const initialSubmission = buildInitialSubmission({
      userId: uid,
      businessName: getBusinessName(userData),
      currentStep,
    });

    await newSubmissionRef.set({
      id: newSubmissionRef.id,
      ...initialSubmission,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastSavedAt: FieldValue.serverTimestamp(),
    });

    await userRef.set(
      {
        activeOnboardingSubmissionId: newSubmissionRef.id,
        onboardingStatus: 'in_progress',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      submissionId: newSubmissionRef.id,
      currentStep,
      route: getRouteForStep(currentStep),
      created: true,
    });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return jsonError(error.message, error.status);
    }

    console.error('Start onboarding submission error:', error);

    return jsonError('Unable to start onboarding submission.', 500);
  }
}