'use client';

import React, { useState } from 'react';
import { Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AdminLoginProps {
  onLogin: (secretKey: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

export function AdminLogin({ onLogin, error, isLoading }: AdminLoginProps) {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onLogin(key.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl">
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Admin Portal</h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Enter your password to moderate pastes and storage.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Admin Secret Key..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
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
          <Key className="w-4 h-4 mr-2" />
          <span>Access Dashboard</span>
        </Button>
      </form>
    </div>
  );
}
