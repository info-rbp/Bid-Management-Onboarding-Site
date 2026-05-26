import { z } from 'zod';

export const submissionIdSchema = z.object({
  submissionId: z.string().trim().min(1, 'submissionId is required.'),
});

export const syncSubmissionBodySchema = submissionIdSchema;

export const internalSignupNotificationSchema = z.object({
  userId: z.string().trim().min(1, 'userId is required.'),
});

export const finalAcknowledgementsSchema = z.object({
  confirmInformationAccurate: z.boolean().optional(),
  confirmAuthorisedToSubmit: z.boolean().optional(),
  acknowledgeInformationUse: z.boolean().optional(),
  acknowledgeReviewApprovalResponsibility: z.boolean().optional(),
  acknowledgeTermsApply: z.boolean().optional(),
}).passthrough();

export const finalizeOnboardingBodySchema = z.object({
  submissionId: z.string().trim().min(1, 'submissionId is required.'),
  finalSubmission: z.object({
    acknowledgements: finalAcknowledgementsSchema.optional(),
    finalComments: z.string().max(5000).optional().default(''),
    submissionSnapshot: z.record(z.string(), z.unknown()).optional().default({}),
  }),
});
