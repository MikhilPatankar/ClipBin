'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminClipTable } from '@/components/admin/AdminClipTable';
import { Button } from '@/components/ui/Button';
import { Shield, LogOut, RefreshCw } from 'lucide-react';
import { AdminStats as IAdminStats, Clip } from '@/types/clip';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('clipbin_admin_key');
    if (saved) {
      setAdminKey(saved);
    }
  }, []);

  const fetchData = useCallback(
    async (key: string, currentPage = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const timestamp = Date.now();

        // Fetch stats
        const statsRes = await fetch(`/api/admin/stats?_t=${timestamp}`, {
          headers: { 'x-admin-key': key },
          cache: 'no-store',
        });

        if (!statsRes.ok) {
          if (statsRes.status === 401) {
            sessionStorage.removeItem('clipbin_admin_key');
            setAdminKey(null);
            throw new Error('Invalid Admin Secret Key. Access denied.');
          }
          throw new Error('Failed to fetch admin stats.');
        }

        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch clips
        const clipsRes = await fetch(`/api/admin/clips?page=${currentPage}&limit=50&_t=${timestamp}`, {
          headers: { 'x-admin-key': key },
          cache: 'no-store',
        });

        if (!clipsRes.ok) {
          throw new Error('Failed to fetch clip listings.');
        }

        const clipsData = await clipsRes.json();
        setClips(clipsData.clips || []);
        setTotal(clipsData.total || 0);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error loading admin data';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (adminKey) {
      fetchData(adminKey, page);
    }
  }, [adminKey, page, fetchData]);

  const handleLogin = (key: string) => {
    sessionStorage.setItem('clipbin_admin_key', key);
    setAdminKey(key);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('clipbin_admin_key');
    setAdminKey(null);
    setStats(null);
    setClips([]);
  };

  const handleDeleteClip = async (slug: string) => {
    if (!adminKey) return;
    try {
      const res = await fetch(`/api/clips/${slug}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete clip.');
        return;
      }

      // Refresh list
      fetchData(adminKey, page);
    } catch (err) {
      console.error('Failed to delete clip:', err);
      alert('Error communicating with server.');
    }
  };

  if (!adminKey) {
    return <AdminLogin onLogin={handleLogin} error={error} isLoading={isLoading} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">System overview, storage usage, and content management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchData(adminKey, page)}
            isLoading={isLoading}
            title="Refresh data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleLogout} className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <AdminStats stats={stats} />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">All Stored Clips</h2>
        <AdminClipTable
          clips={clips}
          total={total}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onDeleteClip={handleDeleteClip}
        />
      </div>
    </div>
  );
}
