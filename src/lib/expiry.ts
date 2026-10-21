import { addHours, addDays, formatDistanceToNow, isPast } from 'date-fns';
import { ExpiryOption } from '@/types/clip';

export const EXPIRY_OPTIONS: { label: string; value: ExpiryOption }[] = [
  { label: 'Never expires', value: 'never' },
  { label: '1 Hour', value: '1h' },
  { label: '6 Hours', value: '6h' },
  { label: '12 Hours', value: '12h' },
  { label: '1 Day', value: '1d' },
  { label: '3 Days', value: '3d' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
];

export function calculateExpiryDate(option?: ExpiryOption): Date | null {
  if (!option || option === 'never') return null;

  const now = new Date();
  switch (option) {
    case '1h':
      return addHours(now, 1);
    case '6h':
      return addHours(now, 6);
    case '12h':
      return addHours(now, 12);
    case '1d':
      return addDays(now, 1);
    case '3d':
      return addDays(now, 3);
    case '7d':
      return addDays(now, 7);
    case '30d':
      return addDays(now, 30);
    default:
      return null;
  }
}

export function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return 'Never';
  const date = new Date(expiresAt);
  if (isPast(date)) return 'Expired';
  return `Expires ${formatDistanceToNow(date, { addSuffix: true })}`;
}
