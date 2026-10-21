'use client';

import React, { useState } from 'react';
import { PasswordGate } from './PasswordGate';
import { ClipMeta } from './ClipMeta';
import { ShareToolbar } from './ShareToolbar';
import { PlainViewer } from './PlainViewer';
import { FileViewer } from './FileViewer';
import { PublicClip } from '@/types/clip';
import { Flame } from 'lucide-react';

interface ClipViewerProps {
  initialClip: PublicClip;
}

export function ClipViewer({ initialClip }: ClipViewerProps) {
  const [clip, setClip] = useState<PublicClip>(initialClip);

  if (clip.password_protected) {
    return <PasswordGate slug={clip.slug} onUnlocked={(unlocked) => setClip(unlocked)} />;
  }

  return (
    <div className="space-y-6">
      {clip.burn_after_read && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs sm:text-sm flex items-center gap-3">
          <Flame className="w-5 h-5 flex-shrink-0 animate-bounce" />
          <span>
            <strong>Burn Notice:</strong> This clip was configured to self-destruct upon viewing. It has
            now been permanently deleted from storage. If you refresh or close this page, it will be gone!
          </span>
        </div>
      )}

      <ClipMeta clip={clip} />

      <ShareToolbar clip={clip} />

      {clip.type === 'file' ? (
        <FileViewer
          slug={clip.slug}
          fileName={clip.file_name}
          fileSize={clip.file_size}
          fileMime={clip.file_mime}
          downloadUrl={clip.download_url}
        />
      ) : (
        <PlainViewer content={clip.content || ''} />
      )}
    </div>
  );
}
