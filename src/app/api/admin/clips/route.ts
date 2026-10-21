import { NextRequest, NextResponse } from 'next/server';
import { listClipsForAdmin } from '@/lib/clips';
import { getEnvValue } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    const expectedKey = getEnvValue('ADMIN_SECRET_KEY');

    if (!expectedKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized. Invalid admin secret key.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await listClipsForAdmin(page, limit);

    // Sanitize before returning (do not return password hashes)
    const sanitizedClips = result.clips.map((clip) => ({
      ...clip,
      password_hash: clip.password_hash ? '***PROTECTED***' : null,
      content: clip.content ? clip.content.slice(0, 200) : null, // preview only
    }));

    return NextResponse.json(
      {
        clips: sanitizedClips,
        total: result.total,
        page,
        limit,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (err) {
    console.error('Error in GET /api/admin/clips:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
