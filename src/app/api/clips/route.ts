import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { generateSlug, validateCustomSlug } from '@/lib/slugs';
import { hashPassword } from '@/lib/password';
import { calculateExpiryDate } from '@/lib/expiry';
import { createClipRecord, getClipRecordBySlug } from '@/lib/clips';
import { CreateClipInput } from '@/types/clip';

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

    const body: CreateClipInput = await req.json();

    if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }

    // Determine slug
    let slug: string;
    let isCustom = false;

    if (body.custom_slug && body.custom_slug.trim() !== '') {
      const slugValidation = validateCustomSlug(body.custom_slug);
      if (!slugValidation.valid) {
        return NextResponse.json({ error: slugValidation.error }, { status: 400 });
      }
      slug = body.custom_slug.trim();
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
    if (body.password && body.password.trim() !== '') {
      passwordHash = await hashPassword(body.password.trim());
    }

    // Expiry calculation
    const expiresDate = calculateExpiryDate(body.expires_in);
    const expiresAt = expiresDate ? expiresDate.toISOString() : null;

    const { data, error } = await createClipRecord({
      slug,
      type: 'text',
      title: body.title?.trim() || null,
      content: body.content,
      language: body.language || 'plaintext',
      render_mode: body.render_mode || 'plain',
      file_name: null,
      file_size: null,
      file_mime: null,
      storage_path: null,
      password_hash: passwordHash,
      expires_at: expiresAt,
      burn_after_read: Boolean(body.burn_after_read),
      custom_slug: isCustom,
    });

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create clip.' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const shareUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/${slug}` : `/${slug}`;

    return NextResponse.json({ slug, url: shareUrl });
  } catch (err: unknown) {
    console.error('Error in POST /api/clips:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
