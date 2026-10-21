import { NextRequest, NextResponse } from 'next/server';
import { getClipRecordBySlug, incrementClipViews, deleteClipRecord } from '@/lib/clips';
import { createSignedDownloadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const clip = await getClipRecordBySlug(slug);

    if (!clip || clip.type !== 'file' || !clip.storage_path) {
      return new NextResponse('File not found', { status: 404 });
    }

    if (clip.expires_at && new Date(clip.expires_at) < new Date()) {
      await deleteClipRecord(slug);
      return new NextResponse('File has expired', { status: 410 });
    }

    if (clip.password_hash) {
      return new NextResponse('Password required to download this file', { status: 401 });
    }

    // Increment views
    await incrementClipViews(clip.id);

    // If burn after read, delete after this download!
    if (clip.burn_after_read) {
      await deleteClipRecord(slug);
    }

    const signedUrl = await createSignedDownloadUrl(clip.storage_path, 300, clip.file_name);
    if (!signedUrl) {
      return new NextResponse('Failed to generate download link', { status: 500 });
    }

    return NextResponse.redirect(signedUrl);
  } catch (err) {
    console.error('Download route error:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
