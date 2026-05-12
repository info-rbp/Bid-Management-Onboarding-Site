import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { createFolder } from '@/lib/google-drive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REQUIRED_ACKNOWLEDGEMENTS = [
  'confirmInformationAccurate',
  'confirmAuthorisedToSubmit',
  'acknowledgeInformationUse',
  'acknowledgeReviewApprovalResponsibility',
  'acknowledgeTermsApply',
];

function getBearerToken(req: Request) {
  const authorization = req.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.replace('Bearer ', '').trim();
  return token || null;
}

function allAcknowledgementsChecked(acknowledgements: Record<string, unknown>) {
  return REQUIRED_ACKNOWLEDGEMENTS.every((key) => acknowledgements?.[key] === true);
}

function getIncompleteRequiredSections(submissionData: any) {
  const visibleStepKeys: string[] = Array.isArray(submissionData.visibleStepKeys)
    ? submissionData.visibleStepKeys
    : [];

  const sectionStatuses = submissionData.sectionStatuses || {};

  return visibleStepKeys.filter((stepKey) => {
    if (stepKey === 'final_submission') return false;

    const status = sectionStatuses?.[stepKey]?.status;
    return status !== 'complete' && status !== 'skipped';
  });
}

export async function POST(req: Request) {
  try {
    const idToken = getBearerToken(req);

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing Firebase ID token.' },
        { status: 401 }
      );
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const { submissionId, finalSubmission } = await req.json();

    if (!submissionId || typeof submissionId !== 'string') {
      return NextResponse.json(
        { error: 'Missing submissionId.' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const submissionRef = db.collection('onboardingSubmissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }

    const submissionData = submissionDoc.data();

    if (!submissionData) {
      return NextResponse.json(
        { error: 'Submission data is missing.' },
        { status: 404 }
      );
    }

    if (submissionData.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    if (submissionData.status === 'submitted' && !submissionData.adminReopened) {
      return NextResponse.json({ error: 'Submission is locked.' }, { status: 409 });
    }

    const acknowledgements = finalSubmission?.acknowledgements || {};

    if (!allAcknowledgementsChecked(acknowledgements)) {
      return NextResponse.json(
        { error: 'Required acknowledgements are incomplete.' },
        { status: 400 }
      );
    }

    const incompleteRequiredSections = getIncompleteRequiredSections(submissionData);

    if (incompleteRequiredSections.length > 0) {
      return NextResponse.json(
        {
          error: 'Required sections are incomplete.',
          incompleteRequiredSections,
        },
        { status: 400 }
      );
    }

    const submittedAt = new Date().toISOString();

    let driveFolderId = submissionData.googleDriveFolderId || null;
    let driveFolderUrl = submissionData.googleDriveFolderUrl || null;

    if (!driveFolderId || !driveFolderUrl) {
      const parentFolderId = process.env.GOOGLE_DRIVE_ONBOARDING_PARENT_FOLDER_ID;
      const folder = await createFolder(
        `Onboarding - ${submissionData.businessName || submissionId}`,
        parentFolderId
      );

      driveFolderId = folder.id || null;
      driveFolderUrl = folder.webViewLink || null;
    }

    if (!driveFolderId || !driveFolderUrl) {
      return NextResponse.json(
        { error: 'Google Drive folder could not be created.' },
        { status: 500 }
      );
    }

    const immutableSnapshot = {
      ...(finalSubmission?.submissionSnapshot || {}),
      generatedAt: submittedAt,
      sourceStatus: submissionData.status || 'in_progress',
    };

    await submissionRef.update({
      status: 'submitted',
      submittedAt,
      completedAt: submittedAt,
      googleDriveFolderId: driveFolderId,
      googleDriveFolderUrl: driveFolderUrl,
      updatedAt: submittedAt,
      adminReopened: false,
      'sections.final_submission.acknowledgements': acknowledgements,
      'sections.final_submission.finalComments': finalSubmission?.finalComments || '',
      'sections.final_submission.submittedAt': submittedAt,
      'sections.final_submission.completedAt': submittedAt,
      'sections.final_submission.submissionSnapshot': immutableSnapshot,
      submissionSnapshot: immutableSnapshot,
      submissionSnapshotLockedAt: submittedAt,
      submissionSnapshotVersion: FieldValue.increment(1),
    });

    await db.collection('users').doc(decodedToken.uid).update({
      onboardingStatus: 'submitted',
      updatedAt: submittedAt,
    });

    return NextResponse.json({
      success: true,
      driveFolderId,
      driveFolderUrl,
      submittedAt,
    });
  } catch (error: any) {
    console.error('Finalize onboarding error:', error);

    return NextResponse.json(
      { error: error?.message || 'Failed to finalize submission.' },
      { status: 500 }
    );
  }
}
