import React from 'react';
import { Metadata } from 'next';
import { getClipRecordBySlug, incrementClipViews, deleteClipRecord } from '@/lib/clips';
import { createSignedDownloadUrl } from '@/lib/storage';
import { ClipViewer } from '@/components/view/ClipViewer';
import { PublicClip } from '@/types/clip';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const clip = await getClipRecordBySlug(params.slug);
  if (!clip) {
    return {
      title: 'Clip Not Found - ClipBin',
    };
  }

  const title = clip.title ? `${clip.title} - ClipBin` : `Clip ${clip.slug} - ClipBin`;
  const description =
    clip.type === 'text'
      ? clip.content?.slice(0, 140) || 'Anonymous text paste'
      : `Shared file: ${clip.file_name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function ViewClipPage({ params }: PageProps) {
  const slug = params.slug;
  const clip = await getClipRecordBySlug(slug);

  if (!clip) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Clip Not Found</h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          This clip doesn&apos;t exist, or it may have been burned after reading or automatically deleted
          after expiration.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check expiration
  if (clip.expires_at && new Date(clip.expires_at) < new Date()) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Clip Expired</h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          This clip reached its expiration time and has been permanently purged.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Create New Clip</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Password protected
  if (clip.password_hash) {
    const protectedClip: PublicClip = {
      slug: clip.slug,
      type: clip.type,
      title: clip.title,
      created_at: clip.created_at,
      expires_at: clip.expires_at,
      burn_after_read: clip.burn_after_read,
      view_count: clip.view_count,
      password_protected: true,
      file_name: clip.file_name,
      file_size: clip.file_size,
      file_mime: clip.file_mime,
      content: null,
      download_url: null,
    };

    return <ClipViewer initialClip={protectedClip} />;
  }

  // Increment view count
  await incrementClipViews(clip.id);

  let downloadUrl: string | null = null;
  if (clip.type === 'file' && clip.storage_path) {
    downloadUrl = await createSignedDownloadUrl(clip.storage_path, 3600, clip.file_name);
  }

  // If burn_after_read
  if (clip.burn_after_read) {
    await deleteClipRecord(slug, false);
  }

  const initialClip: PublicClip = {
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
    burn_after_read: false,
    view_count: clip.view_count + 1,
    created_at: clip.created_at,
    password_protected: false,
  };

  return <ClipViewer initialClip={initialClip} />;
}
