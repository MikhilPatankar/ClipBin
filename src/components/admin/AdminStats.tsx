import React from 'react';
import { Layers, FileText, UploadCloud, HardDrive, CheckCircle } from 'lucide-react';
import { AdminStats as IAdminStats } from '@/types/clip';
import { formatBytes } from '@/lib/mime';

interface AdminStatsProps {
  stats: IAdminStats | null;
}

export function AdminStats({ stats }: AdminStatsProps) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Clips',
      value: stats.totalClips,
      icon: Layers,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
    },
    {
      label: 'Text Pastes',
      value: stats.totalTextClips,
      icon: FileText,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'File Uploads',
      value: stats.totalFileClips,
      icon: UploadCloud,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Storage Used',
      value: formatBytes(stats.totalStorageBytes),
      icon: HardDrive,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Active Clips',
      value: stats.activeClips,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{c.label}</span>
              <div className={`p-1.5 rounded-lg border ${c.bg} ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{c.value}</p>
          </div>
        );
      })}
    </div>
  );
}
