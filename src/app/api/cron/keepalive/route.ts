import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const adminKey = req.headers.get('x-admin-key');
    const cronSecret = process.env.CRON_SECRET;
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    const isAuthorized =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (adminSecret && adminKey === adminSecret);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    // Light query to keep PostgreSQL from sleeping
    const { count, error } = await supabase.from('clips').select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase keepalive ping successful',
      clipCount: count ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error in cron keepalive:', err);
    return NextResponse.json({ error: 'Keepalive ping failed' }, { status: 500 });
  }
}
