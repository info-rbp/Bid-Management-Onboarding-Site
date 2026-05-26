import { describe, expect, it } from 'vitest';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  it('allows requests under the configured limit', () => {
    const first = rateLimit({
      key: 'test:allow',
      limit: 2,
      windowMs: 1000,
    });

    const second = rateLimit({
      key: 'test:allow',
      limit: 2,
      windowMs: 1000,
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
  });

  it('blocks requests above the configured limit', () => {
    rateLimit({
      key: 'test:block',
      limit: 1,
      windowMs: 1000,
    });

    const blocked = rateLimit({
      key: 'test:block',
      limit: 1,
      windowMs: 1000,
    });

    expect(blocked.ok).toBe(false);
  });
});
