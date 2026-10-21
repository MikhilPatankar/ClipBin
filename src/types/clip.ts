export type ClipType = 'text' | 'file';
export type RenderMode = 'plain' | 'markdown' | 'code';

export interface Clip {
  id: string;
  slug: string;
  type: ClipType;
  title: string | null;
  content: string | null;
  language: string | null;
  render_mode: RenderMode;
  file_name: string | null;
  file_size: number | null;
  file_mime: string | null;
  storage_path: string | null;
  password_hash: string | null;
  expires_at: string | null;
  burn_after_read: boolean;
  view_count: number;
  custom_slug: boolean;
  created_at: string;
}

export interface PublicClip {
  slug: string;
  type: ClipType;
  title: string | null;
  content?: string | null;
  language?: string | null;
  render_mode?: RenderMode;
  file_name?: string | null;
  file_size?: number | null;
  file_mime?: string | null;
  download_url?: string | null;
  expires_at: string | null;
  burn_after_read: boolean;
  view_count: number;
  created_at: string;
  password_protected: boolean;
}

export type ExpiryOption = 'never' | '1h' | '6h' | '12h' | '1d' | '3d' | '7d' | '30d';

export interface CreateClipInput {
  type: 'text';
  title?: string;
  content: string;
  language?: string;
  render_mode?: RenderMode;
  password?: string;
  expires_in?: ExpiryOption;
  burn_after_read?: boolean;
  custom_slug?: string;
}

export interface AdminStats {
  totalClips: number;
  totalTextClips: number;
  totalFileClips: number;
  totalStorageBytes: number;
  activeClips: number;
}
