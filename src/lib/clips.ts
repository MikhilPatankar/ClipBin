import { getServiceSupabase } from './supabase/server';
import { Clip, AdminStats } from '@/types/clip';
import { deleteFileFromStorage } from './storage';

export async function createClipRecord(clip: Omit<Clip, 'id' | 'created_at' | 'view_count'>): Promise<{ data: Clip | null; error: Error | null }> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('clips')
      .insert([clip])
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: data as Clip, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return { data: null, error: new Error(message) };
  }
}

export async function getClipRecordBySlug(slug: string): Promise<Clip | null> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as Clip;
  } catch (err) {
    console.error('Error fetching clip by slug:', err);
    return null;
  }
}

export async function incrementClipViews(id: string): Promise<void> {
  try {
    const supabase = getServiceSupabase();
    const { data } = await supabase.from('clips').select('view_count').eq('id', id).single();
    if (data) {
      await supabase.from('clips').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);
    }
  } catch (err) {
    console.error('Failed to increment view count:', err);
  }
}

export async function deleteClipRecord(slug: string, deleteStorageNow: boolean = true): Promise<boolean> {
  try {
    const supabase = getServiceSupabase();
    const clip = await getClipRecordBySlug(slug);
    if (!clip) return false;

    if (clip.storage_path) {
      if (deleteStorageNow) {
        await deleteFileFromStorage(clip.storage_path);
      } else {
        // Keep file in storage for 10 minutes so current user can download
        setTimeout(() => {
          if (clip.storage_path) {
            deleteFileFromStorage(clip.storage_path).catch(() => {});
          }
        }, 10 * 60 * 1000);
      }
    }

    const { error } = await supabase.from('clips').delete().eq('slug', slug);
    return !error;
  } catch (err) {
    console.error('Failed to delete clip record:', err);
    return false;
  }
}

export async function listClipsForAdmin(page: number = 1, limit: number = 50): Promise<{ clips: Clip[]; total: number }> {
  try {
    const supabase = getServiceSupabase();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from('clips')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error || !data) {
      return { clips: [], total: 0 };
    }

    return { clips: data as Clip[], total: count || 0 };
  } catch (err) {
    console.error('Failed to list admin clips:', err);
    return { clips: [], total: 0 };
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const supabase = getServiceSupabase();
    const { data: clips, error } = await supabase.from('clips').select('type, file_size, expires_at');
    if (error || !clips) {
      return { totalClips: 0, totalTextClips: 0, totalFileClips: 0, totalStorageBytes: 0, activeClips: 0 };
    }

    const now = new Date().toISOString();
    let totalText = 0;
    let totalFiles = 0;
    let storageBytes = 0;
    let active = 0;

    for (const c of clips) {
      if (c.type === 'text') totalText++;
      if (c.type === 'file') {
        totalFiles++;
        if (c.file_size) storageBytes += Number(c.file_size);
      }
      if (!c.expires_at || c.expires_at > now) {
        active++;
      }
    }

    return {
      totalClips: clips.length,
      totalTextClips: totalText,
      totalFileClips: totalFiles,
      totalStorageBytes: storageBytes,
      activeClips: active,
    };
  } catch (err) {
    console.error('Failed to get admin stats:', err);
    return { totalClips: 0, totalTextClips: 0, totalFileClips: 0, totalStorageBytes: 0, activeClips: 0 };
  }
}

export async function deleteExpiredClips(): Promise<{ deletedCount: number }> {
  try {
    const supabase = getServiceSupabase();
    const now = new Date().toISOString();

    const { data: expiredClips, error: selectError } = await supabase
      .from('clips')
      .select('slug, storage_path')
      .not('expires_at', 'is', null)
      .lt('expires_at', now);

    if (selectError || !expiredClips || expiredClips.length === 0) {
      return { deletedCount: 0 };
    }

    for (const clip of expiredClips) {
      if (clip.storage_path) {
        await deleteFileFromStorage(clip.storage_path);
      }
    }

    const slugs = expiredClips.map((c) => c.slug);
    const { error: deleteError } = await supabase.from('clips').delete().in('slug', slugs);

    if (deleteError) {
      console.error('Failed to delete expired records:', deleteError);
      return { deletedCount: 0 };
    }

    return { deletedCount: slugs.length };
  } catch (err) {
    console.error('Cleanup job error:', err);
    return { deletedCount: 0 };
  }
}
