import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/clips';
import { getEnvValue } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    const expectedKey = getEnvValue('ADMIN_SECRET_KEY');

    if (!expectedKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getAdminStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Error in GET /api/admin/stats:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
