import React, { useState } from 'react';
import { Clock, Lock, Flame, Link2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { EXPIRY_OPTIONS } from '@/lib/expiry';
import { ExpiryOption } from '@/types/clip';

interface OptionsPanelProps {
  expiry: ExpiryOption;
  onChangeExpiry: (val: ExpiryOption) => void;
  password: string;
  onChangePassword: (val: string) => void;
  burnAfterRead: boolean;
  onChangeBurnAfterRead: (val: boolean) => void;
  customSlug: string;
  onChangeCustomSlug: (val: string) => void;
}

export function OptionsPanel({
  expiry,
  onChangeExpiry,
  password,
  onChangePassword,
  burnAfterRead,
  onChangeBurnAfterRead,
  customSlug,
  onChangeCustomSlug,
}: OptionsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>Security & Expiry Settings</span>
          {(password || burnAfterRead || customSlug || expiry !== 'never') && (
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          )}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-zinc-200 dark:border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Expires After</span>
            </label>
            <select
              value={expiry}
              onChange={(e) => onChangeExpiry(e.target.value as ExpiryOption)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {EXPIRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Password Protection (Optional)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="clip_secret_password"
                autoComplete="new-password"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                placeholder="Leave blank for public access"
                value={password}
                onChange={(e) => onChangePassword(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-0.5 rounded transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              <Link2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Custom Short URL Slug (Optional)</span>
            </label>
            <div className="flex rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700/60 overflow-hidden focus-within:ring-1 focus-within:ring-brand-500">
              <span className="px-2.5 py-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-900/60 border-r border-zinc-300 dark:border-zinc-800 select-none">
                clip/
              </span>
              <input
                type="text"
                placeholder="my-custom-name"
                value={customSlug}
                onChange={(e) => onChangeCustomSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-transparent text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => onChangeBurnAfterRead(!burnAfterRead)}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                burnAfterRead
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-sm shadow-rose-500/10'
                  : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 transition-colors ${burnAfterRead ? 'text-rose-500 animate-pulse' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span className="text-xs font-semibold">Burn after reading</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    burnAfterRead ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      burnAfterRead ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
