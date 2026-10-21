import { NextRequest, NextResponse } from 'next/server';
import { getClipRecordBySlug, incrementClipViews, deleteClipRecord } from '@/lib/clips';
import { verifyPassword } from '@/lib/password';
import { createSignedDownloadUrl } from '@/lib/storage';
import { PublicClip } from '@/types/clip';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await req.json().catch(() => ({}));
    const password = body.password;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const clip = await getClipRecordBySlug(slug);

    if (!clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
    }

    // Check expiry
    if (clip.expires_at && new Date(clip.expires_at) < new Date()) {
      await deleteClipRecord(slug);
      return NextResponse.json({ error: 'This clip has expired.' }, { status: 410 });
    }

    if (!clip.password_hash) {
      return NextResponse.json({ error: 'This clip is not password protected.' }, { status: 400 });
    }

    const isMatch = await verifyPassword(password, clip.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid password. Please try again.' }, { status: 401 });
    }

    // Password is valid
    await incrementClipViews(clip.id);

    // If burn after read, delete now
    if (clip.burn_after_read) {
      await deleteClipRecord(slug);
    }

    let downloadUrl: string | null = null;
    if (clip.type === 'file' && clip.storage_path) {
      downloadUrl = await createSignedDownloadUrl(clip.storage_path, 3600, clip.file_name);
    }

    const responseData: PublicClip = {
      slug: clip.slug,
      type: clip.type,
      title: clip.title,
      content: clip.content,
      language: clip.language,
      render_mode: clip.render_mode,
      file_name: clip.file_name,
      file_size: clip.file_size,
      file_mime: clip.file_mime,
      download_url: downloadUrl,
      expires_at: clip.expires_at,
      burn_after_read: clip.burn_after_read,
      view_count: clip.view_count + 1,
      created_at: clip.created_at,
      password_protected: false,
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error('Error unlocking clip:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
