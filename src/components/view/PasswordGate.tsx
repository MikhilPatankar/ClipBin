'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PublicClip } from '@/types/clip';

interface PasswordGateProps {
  slug: string;
  onUnlocked: (clip: PublicClip) => void;
}

export function PasswordGate({ slug, onUnlocked }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/clips/${slug}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect password.');
      }

      onUnlocked(data as PublicClip);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid password';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors">
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Protected Clip</h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          This clip is password protected. Enter the password below to decrypt and view the contents.
        </p>
      </div>

      <form onSubmit={handleUnlock} className="space-y-4">
        <Input
          type="password"
          placeholder="Enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          error={error || undefined}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          className="w-full"
        >
          <KeyRound className="w-4 h-4 mr-2" />
          <span>Unlock Clip</span>
        </Button>
      </form>
    </div>
  );
}
