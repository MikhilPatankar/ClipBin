'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, QrCode, FileCode, Download, PlusCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useClipboard } from '@/hooks/useClipboard';
import { PublicClip } from '@/types/clip';

interface ShareToolbarProps {
  clip: PublicClip;
}

export function ShareToolbar({ clip }: ShareToolbarProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const { hasCopied, copy } = useClipboard();

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `/${clip.slug}`;
  const rawUrl = `/${clip.slug}/raw`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copy(currentUrl)}
            className="text-xs"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{hasCopied ? 'Link Copied!' : 'Copy Link'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsQrOpen(true)}
            className="text-xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </Button>

          {clip.type === 'text' && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700/60"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Raw</span>
            </a>
          )}

          {clip.type === 'file' && (clip.download_url || clip.slug) && (
            <a
              href={clip.download_url || `/api/clips/${clip.slug}/download`}
              download={clip.file_name || 'file'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}
        </div>

        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-brand-600 dark:text-brand-400" />
              <span>Create New</span>
            </Button>
          </Link>
        </div>
      </div>

      <Modal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title="Share QR Code">
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="p-4 bg-white rounded-xl shadow-lg border border-zinc-200">
            <QRCodeSVG value={currentUrl} size={220} level="M" />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center font-mono break-all">{currentUrl}</p>
        </div>
      </Modal>
    </>
  );
}
