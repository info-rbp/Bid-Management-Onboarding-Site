export function getSafeReturnUrl(input: string | null | undefined): string {
  const fallback = '/dashboard';
  if (!input) return fallback;

  const value = input.trim();
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  if (value.startsWith('/\\')) return fallback;
  if (/^[\s\u0000-\u001F]/.test(value)) return fallback;

  return value;
}
