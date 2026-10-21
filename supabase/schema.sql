-- ==============================================================================
-- ClipBin Database Schema for Supabase PostgreSQL
-- ==============================================================================

-- 1. Create table clips
CREATE TABLE IF NOT EXISTS clips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,           -- short public ID or custom slug
  type            TEXT NOT NULL CHECK (type IN ('text', 'file')),
  
  -- TEXT paste fields
  title           TEXT,                           -- optional display title
  content         TEXT,                           -- raw text/code content (NULL for files)
  language        TEXT DEFAULT 'plaintext',       -- syntax highlight language
  render_mode     TEXT DEFAULT 'plain'            -- 'plain' | 'markdown' | 'code'
    CHECK (render_mode IN ('plain', 'markdown', 'code')),

  -- FILE upload fields
  file_name       TEXT,                           -- original filename (NULL for text)
  file_size       BIGINT,                         -- size in bytes
  file_mime       TEXT,                           -- MIME type
  storage_path    TEXT,                           -- Supabase Storage path (NULL for text)

  -- Shared metadata
  password_hash   TEXT,                           -- bcrypt hash, NULL = no password
  expires_at      TIMESTAMPTZ,                    -- NULL = never expires
  burn_after_read BOOLEAN NOT NULL DEFAULT FALSE, -- delete after first view
  view_count      BIGINT NOT NULL DEFAULT 0,
  custom_slug     BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE if user provided the slug

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast lookups & expiry cleanup
CREATE INDEX IF NOT EXISTS idx_clips_slug ON clips(slug);
CREATE INDEX IF NOT EXISTS idx_clips_expires_at ON clips(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- Allow public read (password verification is handled in application layer)
CREATE POLICY "Public read clips" ON clips
  FOR SELECT USING (true);

-- Allow public insert (anyone can create a clip anonymously)
CREATE POLICY "Public insert clips" ON clips
  FOR INSERT WITH CHECK (true);
