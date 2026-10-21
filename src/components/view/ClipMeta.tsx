import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Eye, Flame, Lock, FileText, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatExpiry } from '@/lib/expiry';
import { PublicClip } from '@/types/clip';

interface ClipMetaProps {
  clip: PublicClip;
}

export function ClipMeta({ clip }: ClipMetaProps) {
  const timeAgo = formatDistanceToNow(new Date(clip.created_at), { addSuffix: true });
  const expiryText = formatExpiry(clip.expires_at);

  return (
    <div className="space-y-3">
      {clip.title && (
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight break-words">
          {clip.title}
        </h1>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <Badge variant="brand" size="md">
          {clip.type === 'text' ? (
            <>
              <FileText className="w-3.5 h-3.5" />
              <span>Text Paste</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5" />
              <span>File ({clip.file_name})</span>
            </>
          )}
        </Badge>

        {clip.password_protected && (
          <Badge variant="warning" size="md">
            <Lock className="w-3.5 h-3.5" />
            <span>Password Protected</span>
          </Badge>
        )}

        {clip.burn_after_read && (
          <Badge variant="danger" size="md">
            <Flame className="w-3.5 h-3.5" />
            <span>Burn after read</span>
          </Badge>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>Created {timeAgo}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-sm">
          <span>{expiryText}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-sm">
          <Eye className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>{clip.view_count} views</span>
        </div>
      </div>
    </div>
  );
}
