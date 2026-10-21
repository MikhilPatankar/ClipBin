export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'com', 'msi', 'scr', 'pif', 'vbs', 'vbe', 'wsf', 'wsh', 'ps1', 'jar'
]);

const BLOCKED_MIME_TYPES = new Set([
  'application/x-msdownload',
  'application/x-executable',
  'application/x-sh',
  'application/x-bat',
  'application/x-dosexec',
]);

export function validateFile(file: { name: string; size: number; type: string }): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum allowed limit of 25 MB.' };
  }

  const parts = file.name.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';

  if (BLOCKED_EXTENSIONS.has(ext) || BLOCKED_MIME_TYPES.has(file.type.toLowerCase())) {
    return { valid: false, error: 'Executable files, scripts, and binaries are blocked for security reasons.' };
  }

  return { valid: true };
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function isImageMime(mime?: string | null): boolean {
  if (!mime) return false;
  return mime.startsWith('image/');
}

export function isPdfMime(mime?: string | null): boolean {
  return mime === 'application/pdf';
}
