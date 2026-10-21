import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { generateSlug, validateCustomSlug } from '@/lib/slugs';
import { hashPassword } from '@/lib/password';
import { calculateExpiryDate } from '@/lib/expiry';
import { validateFile } from '@/lib/mime';
import { uploadFileToStorage, deleteFileFromStorage } from '@/lib/storage';
import { createClipRecord, getClipRecordBySlug } from '@/lib/clips';
import { ExpiryOption } from '@/types/clip';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit reached. Please wait ${rateCheck.retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const password = formData.get('password') as string | null;
    const expiresIn = formData.get('expires_in') as ExpiryOption | null;
    const burnAfterRead = formData.get('burn_after_read') === 'true';
    const customSlug = formData.get('custom_slug') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate file
    const fileValidation = validateFile({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    });

    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Determine slug
    let slug: string;
    let isCustom = false;

    if (customSlug && customSlug.trim() !== '') {
      const slugValidation = validateCustomSlug(customSlug);
      if (!slugValidation.valid) {
        return NextResponse.json({ error: slugValidation.error }, { status: 400 });
      }
      slug = customSlug.trim();
      const existing = await getClipRecordBySlug(slug);
      if (existing) {
        return NextResponse.json({ error: 'Custom slug is already taken. Choose another.' }, { status: 409 });
      }
      isCustom = true;
    } else {
      slug = generateSlug(6);
      let attempts = 0;
      while (attempts < 5 && (await getClipRecordBySlug(slug))) {
        slug = generateSlug(6);
        attempts++;
      }
    }

    // Password hashing
    let passwordHash: string | null = null;
    if (password && password.trim() !== '') {
      passwordHash = await hashPassword(password.trim());
    }

    // Expiry calculation
    const expiresDate = calculateExpiryDate(expiresIn || undefined);
    const expiresAt = expiresDate ? expiresDate.toISOString() : null;

    // Upload to Supabase Storage
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${slug}/${safeFileName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: storageError } = await uploadFileToStorage(
      storagePath,
      buffer,
      file.type || 'application/octet-stream'
    );

    if (storageError) {
      return NextResponse.json({ error: `Storage upload failed: ${storageError.message}` }, { status: 500 });
    }

    // Create DB record
    const { data, error: dbError } = await createClipRecord({
      slug,
      type: 'file',
      title: title?.trim() || null,
      content: null,
      language: null,
      render_mode: 'plain',
      file_name: file.name,
      file_size: file.size,
      file_mime: file.type || 'application/octet-stream',
      storage_path: storagePath,
      password_hash: passwordHash,
      expires_at: expiresAt,
      burn_after_read: burnAfterRead,
      custom_slug: isCustom,
    });

    if (dbError || !data) {
      // Rollback storage file
      await deleteFileFromStorage(storagePath);
      return NextResponse.json({ error: dbError?.message || 'Failed to save file metadata.' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const shareUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/${slug}` : `/${slug}`;

    return NextResponse.json({ slug, url: shareUrl });
  } catch (err: unknown) {
    console.error('Error in POST /api/upload:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
