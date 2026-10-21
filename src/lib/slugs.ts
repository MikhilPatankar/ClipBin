import { customAlphabet } from 'nanoid';

const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const nanoid = customAlphabet(ALPHABET, 6);

export const RESERVED_SLUGS = new Set([
  'api',
  '_admin',
  'admin',
  'raw',
  'login',
  'logout',
  'signup',
  'register',
  'about',
  'terms',
  'privacy',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'health',
  'status',
  'dashboard',
]);

export function generateSlug(length: number = 6): string {
  return nanoid(length);
}

export function validateCustomSlug(slug: string): { valid: boolean; error?: string } {
  const trimmed = slug.trim();
  if (trimmed.length < 3 || trimmed.length > 50) {
    return { valid: false, error: 'Custom slug must be between 3 and 50 characters long.' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Custom slug can only contain letters, numbers, hyphens, and underscores.' };
  }

  if (RESERVED_SLUGS.has(trimmed.toLowerCase())) {
    return { valid: false, error: `The slug "${trimmed}" is reserved by the system.` };
  }

  return { valid: true };
}
