'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, ExternalLink, Lock, Flame, FileText, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
import { Clip } from '@/types/clip';
import { formatBytes } from '@/lib/mime';
import { formatExpiry } from '@/lib/expiry';

interface AdminClipTableProps {
  clips: Clip[];
  total: number;
  page: number;
  onPageChange: (newPage: number) => void;
  onDeleteClip: (slug: string) => Promise<void>;
}

export function AdminClipTable({ clips, total, page, onPageChange, onDeleteClip }: AdminClipTableProps) {
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to permanently delete clip "${slug}"?`)) return;
    setDeletingSlug(slug);
    try {
      await onDeleteClip(slug);
    } finally {
      setDeletingSlug(null);
    }
  };

  const totalPages = Math.ceil(total / 50) || 1;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
          <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="py-3 px-4">Slug / Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Expiry</th>
              <th className="py-3 px-4">Views</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-mono">
            {clips.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500 font-sans">
                  No clips found.
                </td>
              </tr>
            ) : (
              clips.map((clip) => (
                <tr key={clip.slug} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${clip.slug}`}
                        target="_blank"
                        className="text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>{clip.slug}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                      </Link>
                      {clip.password_hash && (
                        <span title="Password protected">
                          <Lock className="w-3 h-3 text-amber-500" />
                        </span>
                      )}
                      {clip.burn_after_read && (
                        <span title="Burn after reading">
                          <Flame className="w-3 h-3 text-rose-500" />
                        </span>
                      )}
                    </div>
                    {clip.title && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-sans mt-0.5">{clip.title}</p>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                      {clip.type === 'text' ? (
                        <>
                          <FileText className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                          <span>Text</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                          <span>File</span>
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {clip.type === 'file' ? (
                      <span>{formatBytes(clip.file_size)}</span>
                    ) : (
                      <span>{clip.content ? `${clip.content.length} chars` : '-'}</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                    {formatDistanceToNow(new Date(clip.created_at), { addSuffix: true })}
                  </td>

                  <td className="py-3 px-4 text-[11px] font-sans">
                    <span className={clip.expires_at ? 'text-amber-600 dark:text-amber-300' : 'text-zinc-400 dark:text-zinc-500'}>
                      {formatExpiry(clip.expires_at)}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-200">{clip.view_count}</td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(clip.slug)}
                      disabled={deletingSlug === clip.slug}
                      className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Delete clip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <span>
            Showing page {page} of {totalPages} ({total} total clips)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
