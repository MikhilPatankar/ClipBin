import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 py-8 text-center text-xs text-zinc-500 transition-colors">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="flex items-center gap-1.5">
          <span>ClipBin</span>
          <span>•</span>
          <span>Anonymous text pastes & private file sharing</span>
        </p>

      </div>
    </footer>
  );
}
