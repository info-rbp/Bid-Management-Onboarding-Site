import { describe, expect, it } from 'vitest';
import {
  sanitizeDriveFolderName,
  buildOnboardingDriveFolderName,
} from './google-drive';
import { sortRowIndexesDescending } from './google-sheets/onboarding-submissions';
import { escapeHtml, cleanSingleLine, isSafeEmail } from './notifications';

describe('Google Drive folder helpers', () => {
  it('sanitizes control characters and collapses whitespace', () => {
    expect(sanitizeDriveFolderName('  Acme\nCorp\tInc\u0000')).toBe('Acme Corp Inc');
  });

  it('falls back to Unknown Business when the name is blank', () => {
    expect(sanitizeDriveFolderName('    ')).toBe('Unknown Business');
  });

  it('builds a safe onboarding folder name including the submission ID', () => {
    const name = buildOnboardingDriveFolderName(' My Biz ', 'sub-123');

    expect(name).toBe('Onboarding - My Biz - sub-123');
  });

  it('truncates long business names while preserving the submission ID', () => {
    const longName = 'A'.repeat(200);
    const name = buildOnboardingDriveFolderName(longName, 'submission-id');

    expect(name).toContain('Onboarding - ');
    expect(name).toContain(' - submission-id');
    expect(name.length).toBeLessThanOrEqual(120);
  });
});

describe('Google Sheets utility helpers', () => {
  it('sorts row indexes in descending order', () => {
    expect(sortRowIndexesDescending([3, 1, 5, 2])).toEqual([5, 3, 2, 1]);
    expect(sortRowIndexesDescending([])).toEqual([]);
  });
});

describe('Notification sanitization helpers', () => {
  it('escapes HTML special characters safely', () => {
    expect(escapeHtml('<script>alert(1)</script> & " \\')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot; \\'
    );
  });

  it('cleans multiline strings into a single trimmed line', () => {
    expect(cleanSingleLine(' line1\nline2\r\n ')).toBe('line1 line2');
  });

  it('validates safe email addresses', () => {
    expect(isSafeEmail('test@example.com')).toBe(true);
    expect(isSafeEmail('invalid-email')).toBe(false);
    expect(isSafeEmail('user@localhost')).toBe(false);
  });
});
