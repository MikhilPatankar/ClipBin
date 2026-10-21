import { NextRequest, NextResponse } from 'next/server';
import { getClipRecordBySlug, incrementClipViews, deleteClipRecord } from '@/lib/clips';
import { createSignedDownloadUrl } from '@/lib/storage';
import { PublicClip } from '@/types/clip';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const clip = await getClipRecordBySlug(slug);

    if (!clip) {
      return NextResponse.json({ error: 'Clip not found or has already been burned.' }, { status: 404 });
    }

    if (clip.expires_at && new Date(clip.expires_at) < new Date()) {
      await deleteClipRecord(slug);
      return NextResponse.json({ error: 'This clip has expired.' }, { status: 410 });
    }

    if (clip.password_hash) {
      return NextResponse.json({ error: 'This clip requires password verification first.' }, { status: 401 });
    }

    // Increment views
    await incrementClipViews(clip.id);

    // Generate download URL before deleting storage if it's a file
    let downloadUrl: string | null = null;
    if (clip.type === 'file' && clip.storage_path) {
      // 1-hour signed download URL so user can download the revealed file
      downloadUrl = await createSignedDownloadUrl(clip.storage_path, 3600, clip.file_name);
    }

    // Now permanently destroy the database record!
    await deleteClipRecord(slug);

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
      burn_after_read: true,
      view_count: clip.view_count + 1,
      created_at: clip.created_at,
      password_protected: false,
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error('Error revealing burned clip:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
