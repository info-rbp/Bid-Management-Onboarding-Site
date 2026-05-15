import { describe, expect, it } from 'vitest';
import { buildAnswerRows, buildSummaryRow, sortRowIndexesDescending, syncOnboardingSubmissionToSheet } from './onboarding-submissions';

describe('onboarding submissions sheets utils', () => {
  it('builds summary row with submission id', () => {
    const row = buildSummaryRow({ submissionId: 'sub-1', data: { userId: 'u1', status: 'submitted' } });
    expect(row[2]).toBe('sub-1');
  });

  it('flattens nested answers', () => {
    const rows = buildAnswerRows({ submissionId: 'sub-1', data: { userId: 'u1', sections: { service_modules: { a: { b: true } } } } });
    expect(rows.some((r) => r[9] === 'a.b')).toBe(true);
  });

  it('sorts rows descending for deletion', () => {
    expect(sortRowIndexesDescending([2, 9, 4])).toEqual([9, 4, 2]);
  });

  it('skips sync when spreadsheet id missing', async () => {
    const old = process.env.ONBOARDING_SUBMISSIONS_SPREADSHEET_ID;
    delete process.env.ONBOARDING_SUBMISSIONS_SPREADSHEET_ID;
    const result = await syncOnboardingSubmissionToSheet({ submissionId: 'sub-1', data: {} });
    expect(result.skipped).toBe(true);
    process.env.ONBOARDING_SUBMISSIONS_SPREADSHEET_ID = old;
  });
});
