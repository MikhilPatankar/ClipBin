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

    if (!clip) {
      return new NextResponse('Clip not found', { status: 404 });
    }

    if (clip.expires_at && new Date(clip.expires_at) < new Date()) {
      await deleteClipRecord(slug);
      return new NextResponse('Clip has expired', { status: 410 });
    }

    if (clip.password_hash) {
      return new NextResponse('Clip is password protected. Please view via the web interface to unlock.', {
        status: 401,
      });
    }

    // Increment views
    await incrementClipViews(clip.id);

    // If burn after read, delete record
    if (clip.burn_after_read) {
      await deleteClipRecord(slug);
    }

    if (clip.type === 'file') {
      if (!clip.storage_path) {
        return new NextResponse('File path not found', { status: 404 });
      }
      const signedUrl = await createSignedDownloadUrl(clip.storage_path, 300);
      if (!signedUrl) {
        return new NextResponse('Unable to generate download link', { status: 500 });
      }
      return NextResponse.redirect(signedUrl);
    }

    // Return plain text
    return new NextResponse(clip.content || '', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('Error fetching raw clip:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
