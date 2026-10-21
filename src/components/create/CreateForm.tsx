'use client';

import React, { useState, useEffect } from 'react';
import { FileText, UploadCloud, ArrowRight, Copy, Check, QrCode, ExternalLink, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TextEditor } from './TextEditor';
import { FileDropzone } from './FileDropzone';
import { OptionsPanel } from './OptionsPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useClipboard } from '@/hooks/useClipboard';
import { ClipType, RenderMode, ExpiryOption } from '@/types/clip';

export function CreateForm() {
  const [tab, setTab] = useState<ClipType>('text');
  const [title, setTitle] = useState('');
  
  const [content, setContent] = useState('');

  const [file, setFile] = useState<File | null>(null);

  const [expiry, setExpiry] = useState<ExpiryOption>('never');
  const [password, setPassword] = useState('');
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [customSlug, setCustomSlug] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const { hasCopied, copy } = useClipboard();

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFile(null);
    setPassword('');
    setBurnAfterRead(false);
    setCustomSlug('');
    setExpiry('never');
    setError(null);
    setCreatedUrl(null);
    setCreatedSlug(null);
  };

  useEffect(() => {
    const handleNewClipEvent = () => {
      resetForm();
    };
    window.addEventListener('clipbin:new-clip', handleNewClipEvent);
    return () => window.removeEventListener('clipbin:new-clip', handleNewClipEvent);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === 'text' && (!content || content.trim() === '')) {
      setError('Please enter some text or code to share.');
      return;
    }

    if (tab === 'file' && !file) {
      setError('Please select or drop a file to upload.');
      return;
    }

    setIsLoading(true);

    try {
      if (tab === 'text') {
        const res = await fetch('/api/clips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'text',
            title: title.trim() || undefined,
            content,
            language: 'plaintext',
            render_mode: 'plain',
            password: password.trim() || undefined,
            expires_in: expiry,
            burn_after_read: burnAfterRead,
            custom_slug: customSlug.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create text paste.');
        }

        const fullUrl = `${window.location.origin}/${data.slug}`;
        setCreatedSlug(data.slug);
        setCreatedUrl(fullUrl);
      } else {
        const formData = new FormData();
        if (file) formData.append('file', file);
        if (title.trim()) formData.append('title', title.trim());
        if (password.trim()) formData.append('password', password.trim());
        if (expiry) formData.append('expires_in', expiry);
        if (burnAfterRead) formData.append('burn_after_read', 'true');
        if (customSlug.trim()) formData.append('custom_slug', customSlug.trim());

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to upload file.');
        }

        const fullUrl = `${window.location.origin}/${data.slug}`;
        setCreatedSlug(data.slug);
        setCreatedUrl(fullUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {createdUrl && (
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 border border-emerald-500/30 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Your Clip is Ready to Share!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
              Anyone with this link can access your {tab === 'text' ? 'paste' : 'file'}
              {password ? ' (protected by password)' : ''}
              {burnAfterRead ? ' - self-destructs after viewing' : ''}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 bg-zinc-100 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              readOnly
              value={createdUrl}
              className="w-full px-3 py-2 text-sm bg-transparent text-brand-600 dark:text-brand-300 font-mono focus:outline-none select-all"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full sm:w-auto flex-1 sm:flex-initial"
                onClick={() => copy(createdUrl)}
              >
                {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopied ? 'Copied!' : 'Copy'}</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsQrModalOpen(true)}
                title="View QR Code"
              >
                <QrCode className="w-4 h-4" />
              </Button>

              <a
                href={createdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                title="Open Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="ghost" size="sm" onClick={resetForm} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
              <RotateCcw className="w-4 h-4 mr-2" />
              Create Another Clip
            </Button>
          </div>

          <Modal
            isOpen={isQrModalOpen}
            onClose={() => setIsQrModalOpen(false)}
            title="Scan Share QR Code"
          >
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
              <div className="p-4 bg-white rounded-xl shadow-lg border border-zinc-200">
                <QRCodeSVG value={createdUrl} size={220} level="M" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center font-mono break-all">{createdUrl}</p>
            </div>
          </Modal>
        </div>
      )}

      {!createdUrl && (
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div className="flex rounded-xl bg-zinc-200 dark:bg-zinc-900/80 p-1 border border-zinc-300 dark:border-zinc-800/80 max-w-sm mx-auto shadow-inner">
            <button
              type="button"
              onClick={() => {
                setTab('text');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                tab === 'text'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Text / Code</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('file');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                tab === 'file'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>File Upload</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <Input
              label="Title or Description"
              placeholder={tab === 'text' ? 'e.g., Database Migration Script' : 'e.g., Project Wireframes v2'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoComplete="off"
              name="clip_title"
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900/40 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl backdrop-blur-sm">
            {tab === 'text' ? (
              <TextEditor
                content={content}
                onChangeContent={setContent}
              />
            ) : (
              <FileDropzone
                selectedFile={file}
                onSelectFile={setFile}
                onErrorChange={(err) => setError(err || null)}
              />
            )}
          </div>

          <OptionsPanel
            expiry={expiry}
            onChangeExpiry={setExpiry}
            password={password}
            onChangePassword={setPassword}
            burnAfterRead={burnAfterRead}
            onChangeBurnAfterRead={setBurnAfterRead}
            customSlug={customSlug}
            onChangeCustomSlug={setCustomSlug}
          />

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              className="w-full sm:w-80 shadow-xl shadow-brand-500/20 font-semibold text-sm sm:text-base py-3"
            >
              <span>{tab === 'text' ? 'Publish Paste' : 'Upload & Share File'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
