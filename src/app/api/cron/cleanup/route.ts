import { NextRequest, NextResponse } from 'next/server';
import { deleteExpiredClips } from '@/lib/clips';

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

    const result = await deleteExpiredClips();
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error in cron cleanup:', err);
    return NextResponse.json({ error: 'Cleanup job failed' }, { status: 500 });
  }
}
