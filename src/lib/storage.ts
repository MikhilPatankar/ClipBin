import { getServiceSupabase } from './supabase/server';

const BUCKET_NAME = 'clips';

export async function uploadFileToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown storage error';
    return { error: new Error(message) };
  }
}

export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  try {
    const supabase = getServiceSupabase();
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
  } catch (err) {
    console.error('Failed to delete storage file:', storagePath, err);
  }
}

export async function createSignedDownloadUrl(
  storagePath: string,
  expiresInSeconds: number = 3600,
  downloadFilename?: string | null
): Promise<string | null> {
  try {
    const supabase = getServiceSupabase();
    const options = downloadFilename ? { download: downloadFilename } : { download: true };
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresInSeconds, options);

    if (error || !data) {
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error('Failed to create signed URL:', storagePath, err);
    return null;
  }
}

export async function createSignedViewUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data) {
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error('Failed to create signed view URL:', storagePath, err);
    return null;
  }
}
