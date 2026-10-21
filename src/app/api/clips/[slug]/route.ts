import { NextRequest, NextResponse } from 'next/server';
import { getClipRecordBySlug, incrementClipViews, deleteClipRecord } from '@/lib/clips';
import { createSignedDownloadUrl } from '@/lib/storage';
import { getEnvValue } from '@/lib/supabase/server';
import { PublicClip } from '@/types/clip';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const clip = await getClipRecordBySlug(slug);

    if (!clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
    }

    // Check expiry
    if (clip.expires_at && new Date(clip.expires_at) < new Date()) {
      await deleteClipRecord(slug);
      return NextResponse.json({ error: 'This clip has expired and is no longer available.' }, { status: 410 });
    }

    // If password-protected, return metadata only without content or download link
    if (clip.password_hash) {
      return NextResponse.json({
        slug: clip.slug,
        type: clip.type,
        title: clip.title,
        created_at: clip.created_at,
        expires_at: clip.expires_at,
        burn_after_read: clip.burn_after_read,
        view_count: clip.view_count,
        file_name: clip.file_name,
        file_size: clip.file_size,
        file_mime: clip.file_mime,
        password_protected: true,
      });
    }

    // Not password protected: increment view count
    await incrementClipViews(clip.id);

    // If burn-after-read: delete the record after access
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
    console.error('Error fetching clip:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    const expectedKey = getEnvValue('ADMIN_SECRET_KEY');

    if (!expectedKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = params.slug;
    const deleted = await deleteClipRecord(slug);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete or clip not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Clip ${slug} deleted successfully.` });
  } catch (err) {
    console.error('Error deleting clip:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
