'use client';

import React from 'react';
import { Download, File, ExternalLink, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatBytes, isImageMime, isPdfMime } from '@/lib/mime';

interface FileViewerProps {
  slug?: string;
  fileName?: string | null;
  fileSize?: number | null;
  fileMime?: string | null;
  downloadUrl?: string | null;
}

export function FileViewer({ slug, fileName, fileSize, fileMime, downloadUrl }: FileViewerProps) {
  const isImage = isImageMime(fileMime);
  const isPdf = isPdfMime(fileMime);

  return (
    <div className="space-y-6">
      {isImage && downloadUrl && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-6 shadow-md dark:shadow-2xl flex justify-center items-center overflow-hidden transition-colors">
          <img
            src={downloadUrl}
            alt={fileName || 'Shared Image'}
            className="max-h-[600px] w-auto max-w-full rounded-xl object-contain shadow-lg"
          />
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-md dark:shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
            {isImage ? (
              <ImageIcon className="w-7 h-7" />
            ) : isPdf ? (
              <FileText className="w-7 h-7" />
            ) : (
              <File className="w-7 h-7" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {fileName || 'Shared File'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
              <span>{formatBytes(fileSize)}</span>
              <span>•</span>
              <span className="font-mono">{fileMime || 'application/octet-stream'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {downloadUrl || slug ? (
            <>
              <a
                href={downloadUrl || `/api/clips/${slug}/download`}
                download={fileName || 'file'}
                className="w-full sm:w-auto"
              >
                <Button variant="primary" size="md" className="w-full sm:w-auto shadow-sm">
                  <Download className="w-4 h-4 mr-2" />
                  <span>Download File</span>
                </Button>
              </a>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </>
          ) : (
            <p className="text-xs text-zinc-500">Download link unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
}
