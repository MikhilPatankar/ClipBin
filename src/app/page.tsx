import React from 'react';
import { CreateForm } from '@/components/create/CreateForm';
import { ShieldCheck, Zap, Lock, QrCode } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="text-center space-y-4 max-w-2xl mx-auto pt-4 sm:pt-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 dark:from-brand-400 dark:via-indigo-300 dark:to-brand-500">
            Share Text & Files.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Paste code, markdown notes, or upload files up to 25MB. Secure with optional passwords,
          custom short URLs, auto-expiration, and burn-after-read self destruction.
        </p>

      </section>

      <section>
        <CreateForm />
      </section>
    </div>
  );
}
