'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';

interface PlainViewerProps {
  content: string;
}

export function PlainViewer({ content }: PlainViewerProps) {
  const { hasCopied, copy } = useClipboard();

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-md dark:shadow-2xl transition-colors">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <span className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
          Plain Text
        </span>
        <button
          onClick={() => copy(content)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-200/80 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 transition-colors"
        >
          {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{hasCopied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 overflow-x-auto">
        <pre className="font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}
