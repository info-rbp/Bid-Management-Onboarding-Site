import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase-admin';
import { rateLimit } from '@/lib/server/rate-limit';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getIpAddress(request: NextRequest | Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireFirebaseUser(request: NextRequest | Request) {
  const authorization = request.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing Firebase ID token.');
  }

  const idToken = authorization.replace('Bearer ', '').trim();

  if (!idToken) {
    throw new HttpError(401, 'Empty Firebase ID token.');
  }

  return getAdminAuth().verifyIdToken(idToken);
}

export function requireInternalSecret(params: {
  headerValue: string | null;
  secret: string | undefined;
  errorMessage?: string;
}) {
  if (!params.secret || params.headerValue !== params.secret) {
    throw new HttpError(401, params.errorMessage || 'Unauthorized');
  }
}

export async function parseJsonBody<T>(
  request: NextRequest | Request,
  schema: z.ZodSchema<T>
) {
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new HttpError(400, issue?.message || 'Invalid request body.');
  }

  return parsed.data;
}

export function applyRateLimit(params: {
  request: NextRequest | Request;
  scope: string;
  subject?: string;
  limit: number;
  windowMs: number;
}) {
  const key = [
    params.scope,
    params.subject || 'anonymous',
    getIpAddress(params.request),
  ].join(':');

  const result = rateLimit({
    key,
    limit: params.limit,
    windowMs: params.windowMs,
  });

  if (!result.ok) {
    throw new HttpError(429, 'Too many requests. Please try again shortly.');
  }

  return result;
}
