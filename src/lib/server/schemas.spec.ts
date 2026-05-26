import { describe, expect, it } from 'vitest';
import { finalizeOnboardingBodySchema } from './schemas';

describe('finalizeOnboardingBodySchema', () => {
  it('accepts a valid finalize payload', () => {
    const parsed = finalizeOnboardingBodySchema.safeParse({
      submissionId: 'abc123',
      finalSubmission: {
        acknowledgements: {
          confirmInformationAccurate: true,
        },
        finalComments: 'Ready to submit',
        submissionSnapshot: {
          sectionCount: 16,
        },
      },
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects an empty submission id', () => {
    const parsed = finalizeOnboardingBodySchema.safeParse({
      submissionId: '   ',
      finalSubmission: {},
    });

    expect(parsed.success).toBe(false);
  });
});
