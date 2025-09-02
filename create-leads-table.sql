-- Run this SQL in your Neon database console to create the leads table

CREATE TABLE IF NOT EXISTS leads (
  id           BIGSERIAL PRIMARY KEY,
  email        TEXT NOT NULL,
  email_norm   TEXT GENERATED ALWAYS AS (lower(email)) STORED,
  kw           TEXT,
  source       TEXT,
  utm          JSONB,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (email_norm)
);

-- Create index for efficient queries by creation date
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

-- Test insert (replace with your email)
-- INSERT INTO leads (email, kw, source, utm)
-- VALUES ('test@example.com', 'Carrier Invoice Audit', 'google_ads', '{"utm_source": "google", "utm_medium": "cpc"}'::jsonb);